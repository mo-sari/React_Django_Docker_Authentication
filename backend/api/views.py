from decimal import Decimal
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view
from django.db.models.functions import ExtractMonth
from django.core.files.uploadedfile import InMemoryUploadedFile
from rest_framework.mixins import DestroyModelMixin

from django.db import models

from . import models as api_models
from . import serializers as api_serializer

from users.models import (
    Profile,
    User
)
from django.core.exceptions import ObjectDoesNotExist
from datetime import datetime, timedelta
from distutils.util import strtobool


class ProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        return Profile.objects.get(user=user)


class CategoryListAPIView(generics.ListAPIView):
    queryset = api_models.Category.objects.filter(active=True)
    serializer_class = api_serializer.CategorySerializer
    permission_classes = [AllowAny]


class CourseListAPIView(generics.ListAPIView):
    queryset = api_models.Course.objects.filter(
        platform_status="Published",
        teacher_course_status="Published")
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]


class CourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]
    queryset = api_models.Course.objects.all()

    def get_object(self):
        slug = self.kwargs['slug']
        course = api_models.Course.objects.get(slug=slug)
        return course


class CartAPIView(generics.CreateAPIView):
    queryset = api_models.Cart.objects.all()
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        user_id = request.data['user_id']
        price = request.data['price']
        country_name = request.data['country_name']
        cart_id = request.data['cart_id']

        print("course_id ==========", course_id)

        course = api_models.Course.objects.filter(id=course_id).first()

        if user_id != "undefined":
            user = User.objects.filter(id=user_id).first()
        else:
            user = None

        try:
            country_object = api_models.Country.objects.filter(
                name=country_name).first()
            country = country_object.name
        except Exception:
            country_object = None
            country = "United States"

        if country_object:
            tax_rate = country_object.tax_rate / 100
        else:
            tax_rate = 0

        cart = api_models.Cart.objects.filter(cart_id=cart_id,
                                              course=course).first()

        if cart:
            cart.course = course
            cart.user = user
            cart.price = price
            cart.tax_fee = Decimal(price) * Decimal(tax_rate)
            cart.country = country
            cart.cart_id = cart_id
            cart.total = Decimal(cart.price) + Decimal(cart.tax_fee)
            cart.save()

            return Response({"message": "Cart Updated Successfully"},
                            status=status.HTTP_200_OK)

        else:
            cart = api_models.Cart()

            cart.course = course
            cart.user = user
            cart.price = price
            cart.tax_fee = Decimal(price) * Decimal(tax_rate)
            cart.country = country
            cart.cart_id = cart_id
            cart.total = Decimal(cart.price) + Decimal(cart.tax_fee)
            cart.save()

            return Response({"message": "Cart Created Successfully"},
                            status=status.HTTP_201_CREATED)


class CartListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        cart_id = self.kwargs['cart_id']
        queryset = api_models.Cart.objects.filter(cart_id=cart_id)
        return queryset


class CartItemDeleteAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        cart_id = self.kwargs['cart_id']
        item_id = self.kwargs['item_id']

        return api_models.Cart.objects.filter(cart_id=cart_id,
                                              id=item_id).first()


class CartStatsAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]
    lookup_field = 'cart_id'

    def get_queryset(self):
        cart_id = self.kwargs['cart_id']
        queryset = api_models.Cart.objects.filter(cart_id=cart_id)
        return queryset

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        total_price = 0.00
        total_tax = 0.00
        total_total = 0.00

        for cart_item in queryset:
            total_price += float(self.calculate_price(cart_item))
            total_tax += float(self.calculate_tax(cart_item))
            total_total += round(float(self.calculate_total(cart_item)), 2)

        data = {
            "price": total_price,
            "tax": total_tax,
            "total": total_total,
        }

        return Response(data)

    def calculate_price(self, cart_item):
        return cart_item.price

    def calculate_tax(self, cart_item):
        return cart_item.tax_fee

    def calculate_total(self, cart_item):
        return cart_item.total


class CreateOrderAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = api_models.CartOrder.objects.all()

    def create(self, request, *args, **kwargs):
        full_name = request.data['full_name']
        email = request.data['email']
        country = request.data['country']
        cart_id = request.data['cart_id']
        user_id = request.data['user_id']

        if user_id != 0:
            user = User.objects.get(id=user_id)
        else:
            user = None

        cart_items = api_models.Cart.objects.filter(cart_id=cart_id)

        total_price = Decimal(0.00)
        total_tax = Decimal(0.00)
        total_initial_total = Decimal(0.00)
        total_total = Decimal(0.00)

        order = api_models.CartOrder.objects.create(
            full_name=full_name,
            email=email,
            country=country,
            student=user
        )

        for c in cart_items:
            api_models.CartOrderItem.objects.create(
                order=order,
                course=c.course,
                price=c.price,
                tax_fee=c.tax_fee,
                total=c.total,
                initial_total=c.total,
                teacher=c.course.teacher
            )

            total_price += Decimal(c.price)
            total_tax += Decimal(c.tax_fee)
            total_initial_total += Decimal(c.total)
            total_total += Decimal(c.total)

            order.teachers.add(c.course.teacher)

        order.sub_total = total_price
        order.tax_fee = total_tax
        order.initial_total = total_initial_total
        order.total = total_total
        order.save()

        return Response({"message": "Order Created Successfully",
                         "order_oid": order.oid},
                        status=status.HTTP_201_CREATED)


class CheckoutAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = api_models.CartOrder.objects.all()
    lookup_field = 'oid'


class CouponApplyAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            order_oid = request.data.get('order_oid')
            coupon_code = request.data.get('coupon_code')

            # Validate order and coupon
            order = api_models.CartOrder.objects.get(oid=order_oid)
            coupon = api_models.Coupon.objects.get(code=coupon_code)

            # Find order items linked to the coupon's teacher
            order_items = api_models.CartOrderItem.objects.filter(
                order=order,
                teacher=coupon.teacher
            )

            # Process each order item
            if order_items.exists():
                for item in order_items:
                    if coupon not in item.coupons.all():
                        discount = item.total * coupon.discount / 100

                        # Update item totals and apply coupon
                        item.total -= discount
                        item.price -= discount
                        item.saved += discount
                        item.applied_coupon = True
                        item.coupons.add(coupon)

                        # Update order totals
                        order.coupons.add(coupon)
                        order.total -= discount
                        order.sub_total -= discount
                        order.saved += discount

                        # Save changes
                        item.save()
                        order.save()

                        # Add coupon usage
                        coupon.used_by.add(order.student)

                        return Response(
                            {"message": "Coupon Found and Activated",
                             "icon": "success"},
                            status=status.HTTP_201_CREATED,
                        )
                return Response(
                    {"message": "Coupon Already Applied", "icon": "warning"},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"message": "No items eligible for the coupon",
                     "icon": "info"},
                    status=status.HTTP_200_OK,
                )

        except ObjectDoesNotExist:
            return Response(
                {"message": "Invalid Order or Coupon", "icon": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"message": f"An error occurred: {str(e)}", "icon": "error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class StudentSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.StudentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)

        total_courses = api_models.EnrolledCourse.objects.filter(
            user=user).count()
        completed_lessons = api_models.CompletedLesson.objects.filter(
            user=user).count()
        achieved_certificates = api_models.Certificate.objects.filter(
            user=user).count()

        return [{
            "total_courses": total_courses,
            "completed_lessons": completed_lessons,
            "achieved_certificates": achieved_certificates,
        }]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class StudentCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        return api_models.EnrolledCourse.objects.filter(user=user)


class StudentCourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]
    lookup_field = 'enrollment_id'

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']

        user = User.objects.get(id=user_id)
        return api_models.EnrolledCourse.objects.get(
            user=user,
            enrollment_id=enrollment_id)


class StudentCourseCompletedCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CompletedLessonSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']
        variant_item_id = request.data['variant_item_id']

        user = User.objects.get(id=user_id)
        course = api_models.Course.objects.get(id=course_id)
        variant_item = api_models.VariantItem.objects.get(
            variant_item_id=variant_item_id)

        completed_lessons = api_models.CompletedLesson.objects.filter(
            user=user, course=course, variant_item=variant_item).first()

        if completed_lessons:
            completed_lessons.delete()
            return Response({"message": "Course marked as not completed"})

        else:
            api_models.CompletedLesson.objects.create(
                user=user,
                course=course,
                variant_item=variant_item)
            return Response({"message": "Course marked as completed"})


class StudentNoteCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']

        user = User.objects.get(id=user_id)
        enrolled = api_models.EnrolledCourse.objects.get(
            enrollment_id=enrollment_id)

        return api_models.Note.objects.filter(user=user,
                                              course=enrolled.course)

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        enrollment_id = request.data['enrollment_id']
        title = request.data['title']
        note = request.data['note']

        user = User.objects.get(id=user_id)
        enrolled = api_models.EnrolledCourse.objects.get(
            enrollment_id=enrollment_id)

        api_models.Note.objects.create(user=user, course=enrolled.course,
                                       note=note, title=title)

        return Response({"message": "Note created successfullly"},
                        status=status.HTTP_201_CREATED)


class StudentNoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']
        note_id = self.kwargs['note_id']

        user = User.objects.get(id=user_id)
        enrolled = api_models.EnrolledCourse.objects.get(
            enrollment_id=enrollment_id)
        note = api_models.Note.objects.get(user=user,
                                           course=enrolled.course, id=note_id)
        return note


class StudentRateCourseCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']
        rating = request.data['rating']
        review = request.data['review']

        user = User.objects.get(id=user_id)
        course = api_models.Course.objects.get(id=course_id)

        api_models.Review.objects.create(
            user=user,
            course=course,
            review=review,
            rating=rating,
            active=True,
        )

        return Response({"message": "Review created successfullly"},
                        status=status.HTTP_201_CREATED)


class StudentRateCourseUpdateAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        review_id = self.kwargs['review_id']

        user = User.objects.get(id=user_id)
        return api_models.Review.objects.get(id=review_id, user=user)


class StudentWishListListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.WishlistSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        return api_models.Wishlist.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']

        user = User.objects.get(id=user_id)
        course = api_models.Course.objects.get(id=course_id)

        wishlist = api_models.Wishlist.objects.filter(user=user,
                                                      course=course).first()
        if wishlist:
            wishlist.delete()
            return Response({"message": "Wishlist Deleted"},
                            status=status.HTTP_200_OK)
        else:
            api_models.Wishlist.objects.create(
                user=user, course=course
            )
            return Response({"message": "Wishlist Created"},
                            status=status.HTTP_201_CREATED)


class QuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        course = api_models.Course.objects.get(id=course_id)
        return api_models.Question_Answer.objects.filter(course=course)

    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        user_id = request.data['user_id']
        title = request.data['title']
        message = request.data['message']

        user = User.objects.get(id=user_id)
        course = api_models.Course.objects.get(id=course_id)

        question = api_models.Question_Answer.objects.create(
            course=course,
            user=user,
            title=title
        )

        api_models.Question_Answer_Message.objects.create(
            course=course,
            user=user,
            message=message,
            question=question
        )

        return Response({"message": "Group conversation Started"},
                        status=status.HTTP_201_CREATED)


class QuestionAnswerDeleteAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        qa_id = self.kwargs['qa_id']

        user = User.objects.get(pk=user_id)
        return api_models.Question_Answer.objects.get(pk=qa_id, user=user)


class QuestionAnswerMessageSendAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.Question_Answer_MessageSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        qa_id = request.data['qa_id']
        user_id = request.data['user_id']
        message = request.data['message']

        user = User.objects.get(id=user_id)
        course = api_models.Course.objects.get(id=course_id)
        question = api_models.Question_Answer.objects.get(qa_id=qa_id)
        api_models.Question_Answer_Message.objects.create(
            course=course,
            user=user,
            message=message,
            question=question
        )

        question_serializer = api_serializer.Question_AnswerSerializer(
            question)
        return Response({"messgae": "Message Sent",
                         "question": question_serializer.data})


class QuestionAnswerMessageUpdateDeleteAPIView(generics.UpdateAPIView,
                                               DestroyModelMixin):

    serializer_class = api_serializer.Question_Answer_MessageSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        qam_id = self.kwargs['qam_id']

        user = User.objects.get(pk=user_id)
        return api_models.Question_Answer_Message.objects.get(user=user,
                                                              id=qam_id)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TeacherSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.TeacherSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)

        one_month_ago = datetime.today() - timedelta(days=28)

        total_courses = api_models.Course.objects.filter(
            teacher=teacher).count()
        total_revenue = api_models.CartOrderItem.objects.filter(
            teacher=teacher, order__payment_status="Paid").aggregate(
                total_revenue=models.Sum("price"))['total_revenue'] or 0
        monthly_revenue = api_models.CartOrderItem.objects.filter(
            teacher=teacher, order__payment_status="Paid",
            date__gte=one_month_ago).aggregate(
                total_revenue=models.Sum("price"))['total_revenue'] or 0

        enrolled_courses = api_models.EnrolledCourse.objects.filter(
            teacher=teacher)
        unique_student_ids = set()
        students = []

        for course in enrolled_courses:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "full_name": user.profile.full_name,
                    "image": user.profile.image.url,
                    "country": user.profile.country,
                    "date": course.date
                }

                students.append(student)
                unique_student_ids.add(course.user_id)

        return [{
            "total_courses": total_courses,
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "total_students": len(students),
        }]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TeacherCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Course.objects.filter(teacher=teacher)


class TeacherReviewListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Review.objects.filter(course__teacher=teacher)


class TeacherReviewDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        review_id = self.kwargs['review_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Review.objects.get(course__teacher=teacher,
                                             id=review_id)


class TeacherStudentsListAPIVIew(viewsets.ViewSet):

    def list(self, request, teacher_id=None):
        teacher = api_models.Teacher.objects.get(id=teacher_id)

        enrolled_courses = api_models.EnrolledCourse.objects.filter(
            teacher=teacher)
        unique_student_ids = set()
        students = []

        for course in enrolled_courses:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "full_name": user.profile.full_name,
                    "image": user.profile.image.url,
                    "country": user.profile.country,
                    "date": course.date
                }

                students.append(student)
                unique_student_ids.add(course.user_id)

        return Response(students)


@api_view(("GET", ))
def TeacherAllMonthEarningAPIView(request, teacher_id):
    teacher = api_models.Teacher.objects.get(id=teacher_id)
    monthly_earning_tracker = (
        api_models.CartOrderItem.objects
        .filter(teacher=teacher, order__payment_status="Paid")
        .annotate(
            month=ExtractMonth("date")
        )
        .values("month")
        .annotate(
            total_earning=models.Sum("price")
        )
        .order_by("month")
    )

    return Response(monthly_earning_tracker)


class TeacherBestSellingCourseAPIView(viewsets.ViewSet):

    def list(self, request, teacher_id=None):
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        courses_with_total_price = []
        courses = api_models.Course.objects.filter(teacher=teacher)

        for course in courses:
            revenue = course.enrolledcourse_set.aggregate(
                total_price=models.Sum(
                    'order_item__price'))['total_price'] or 0
            sales = course.enrolledcourse_set.count()

            courses_with_total_price.append({
                'course_image': course.image.url,
                'course_title': course.title,
                'revenue': revenue,
                'sales': sales,
            })

        return Response(courses_with_total_price)


class TeacherCourseOrdersListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CartOrderItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)

        return api_models.CartOrderItem.objects.filter(teacher=teacher)


class TeacherQuestionAnswerListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Question_Answer.objects.filter(
            course__teacher=teacher)


class TeacherCouponListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Coupon.objects.filter(teacher=teacher)


class TeacherCouponDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        coupon_id = self.kwargs['coupon_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Coupon.objects.get(teacher=teacher, id=coupon_id)


class TeacherNotificationListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Notification.objects.filter(
            teacher=teacher, seen=False)


class TeacherNotificationDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        noti_id = self.kwargs['noti_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Notification.objects.get(teacher=teacher, id=noti_id)


class CourseCreateAPIView(generics.CreateAPIView):
    querysect = api_models.Course.objects.all()
    serializer_class = api_serializer.CourseSerializer
    permisscion_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.is_valid(raise_exception=True)
        course_instance = serializer.save()

        variant_data = []
        for key, value in self.request.data.items():
            if key.startswith('variant') and '[variant_title]' in key:
                index = key.split('[')[1].split(']')[0]
                title = value

                variant_dict = {'title': title}
                item_data_list = []
                current_item = {}
                variant_data = []

                for item_key, item_value in self.request.data.items():
                    if f'variants[{index}][items]' in item_key:
                        field_name = item_key.split('[')[-1].split(']')[0]
                        if field_name == "title":
                            if current_item:
                                item_data_list.append(current_item)
                            current_item = {}
                        current_item.update({field_name: item_value})

                if current_item:
                    item_data_list.append(current_item)

                variant_data.append({'variant_data': variant_dict,
                                     'variant_item_data': item_data_list})

        for data_entry in variant_data:
            variant = api_models.Variant.objects.create(
                title=data_entry['variant_data']['title'],
                course=course_instance)

            for item_data in data_entry['variant_item_data']:
                preview_value = item_data.get("preview")
                preview = bool(strtobool(str(
                    preview_value))) if preview_value is not None else False

                api_models.VariantItem.objects.create(
                    variant=variant,
                    title=item_data.get("title"),
                    description=item_data.get("description"),
                    file=item_data.get("file"),
                    preview=preview,
                )

    def save_nested_data(self, course_instance, serializer_class, data):
        serializer = serializer_class(data=data,
                                      many=True,
                                      context={"course_instance":
                                               course_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course_instance)


class CourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    querysect = api_models.Course.objects.all()
    serializer_class = api_serializer.CourseSerializer
    permisscion_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        teacher = api_models.Teacher.objects.get(id=teacher_id)
        course = api_models.Course.objects.get(course_id=course_id)

        return course

    def update(self, request, *args, **kwargs):
        course = self.get_object()
        serializer = self.get_serializer(course, data=request.data)
        serializer.is_valid(raise_exception=True)

        if "image" in request.data and isinstance(request.data['image'],
                                                  InMemoryUploadedFile):
            course.image = request.data['image']
        elif 'image' in request.data and str(request
                                             .data['image']) == "No File":
            course.image = None

        if 'file' in request.data and not str(request
                                              .data['file']).startswith(
                                                  "http://"):
            course.file = request.data['file']

        if 'category' in request.data['category'] and request.data['category'] != 'NaN' and request.data['category'] != "undefined":
            category = api_models.Category.objects.get(
                id=request.data['category'])
            course.category = category

        self.perform_update(serializer)
        self.update_variant(course, request.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update_variant(self, course, request_data):
        for key, value in request_data.items():
            if key.startswith("variants") and '[variant_title]' in key:

                index = key.split('[')[1].split(']')[0]
                title = value

                id_key = f"variants[{index}][variant_id]"
                variant_id = request_data.get(id_key)

                variant_data = {'title': title}
                item_data_list = []
                current_item = {}

                for item_key, item_value in request_data.items():
                    if f'variants[{index}][items]' in item_key:
                        field_name = item_key.split('[')[-1].split(']')[0]
                        if field_name == "title":
                            if current_item:
                                item_data_list.append(current_item)
                            current_item = {}
                        current_item.update({field_name: item_value})

                if current_item:
                    item_data_list.append(current_item)

                existing_variant = course.variant_set.filter(
                    id=variant_id).first()

                if existing_variant:
                    existing_variant.title = title
                    existing_variant.save()

                    for item_data in item_data_list[1:]:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        variant_item = api_models.VariantItem.objects.filter(
                            variant_item_id=item_data.get(
                                "variant_item_id")).first()

                        if not str(item_data.get("file")).startswith("http://"):
                            if item_data.get("file") != "null":
                                file = item_data.get("file")
                            else:
                                file = None

                            title = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title
                                variant_item.description = description
                                variant_item.file = file
                                variant_item.preview = preview
                            else:
                                variant_item = api_models.VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title,
                                    description=description,
                                    file=file,
                                    preview=preview
                                )

                        else:
                            title = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title
                                variant_item.description = description
                                variant_item.preview = preview
                            else:
                                variant_item = api_models.VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title,
                                    description=description,
                                    preview=preview
                                )

                        variant_item.save()

                else:
                    new_variant = api_models.Variant.objects.create(
                        course=course, title=title
                    )

                    for item_data in item_data_list:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        api_models.VariantItem.objects.create(
                            variant=new_variant,
                            title=item_data.get("title"),
                            description=item_data.get("description"),
                            file=item_data.get("file"),
                            preview=preview,
                        )

    def save_nested_data(self, course_instance, serializer_class, data):
        serializer = serializer_class(data=data, many=True,
                                      context={"course_instance":
                                               course_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course_instance)


class CourseVariantDeleteAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.VariantSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        variant_id = self.kwargs['variant_id']
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        print("variant_id ========", variant_id)

        teacher = api_models.Teacher.objects.get(id=teacher_id)
        course = api_models.Course.objects.get(teacher=teacher,
                                               course_id=course_id)
        return api_models.Variant.objects.get(id=variant_id)


class CourseVariantItemDeleteAPIVIew(generics.DestroyAPIView):
    serializer_class = api_serializer.VariantItemSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        variant_id = self.kwargs['variant_id']
        variant_item_id = self.kwargs['variant_item_id']
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        teacher = api_models.Teacher.objects.get(id=teacher_id)
        course = api_models.Course.objects.get(teacher=teacher,
                                               course_id=course_id)
        variant = api_models.Variant.objects.get(variant_id=variant_id,
                                                 course=course)
        return api_models.VariantItem.objects.get(
            variant=variant,
            variant_item_id=variant_item_id)


class CourseReivewListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        course_id = self.kwargs['course_id']

        user = User.objects.get(id=user_id)
        course = api_models.Course.objects.get(id=course_id)

        return api_models.Review.objects.filter(user=user, course=course)
