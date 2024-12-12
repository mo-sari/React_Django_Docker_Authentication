from django.contrib import admin
from . import models


class VariantAdminHelper(admin.ModelAdmin):
    list_display = ['id', 'title', 'get_course_name']

    def get_course_name(self, obj):
        return obj.course.title


class CartAdminHelper(admin.ModelAdmin):
    list_display = ['get_course_name', 'get_user_name']

    def get_user_name(self, obj):
        return obj.user.name

    def get_course_name(self, obj):
        return obj.course.title


class CartOrderItemAdminHelper(admin.ModelAdmin):
    list_display = ['oid', 'get_course_name', 'get_user_name']

    def get_user_name(self, obj):
        return obj.order.student.name

    def get_course_name(self, obj):
        return obj.course.title


class CourseAdminHelper(admin.ModelAdmin):
    list_display = ['id', 'title', 'get_teacher_name']

    def get_teacher_name(self, obj):
        return obj.teacher.user.name


class EnrolledCourseAdminHelper(admin.ModelAdmin):
    list_display = ['get_course_name', 'get_user_name']

    def get_user_name(self, obj):
        return obj.user.name

    def get_course_name(self, obj):
        return obj.course.title


class VariantItemAdminHelper(admin.ModelAdmin):
    list_display = ['get_variant_item_id', 'title', 'get_course_name']

    def get_course_name(self, obj):
        return obj.variant.course.title

    def get_variant_item_id(self, obj):
        return obj.variant_item_id


class ReviewAdminHelper(admin.ModelAdmin):
    list_display = ['id', 'get_course_name', 'get_user_name']

    def get_course_name(self, obj):
        return obj.course.title

    def get_user_name(self, obj):
        return obj.user.name


admin.site.register(models.Category)
admin.site.register(models.Course, CourseAdminHelper)
admin.site.register(models.Variant, VariantAdminHelper)
admin.site.register(models.VariantItem, VariantItemAdminHelper)
admin.site.register(models.Question_Answer)
admin.site.register(models.Note)
admin.site.register(models.Teacher)
admin.site.register(models.Question_Answer_Message)
admin.site.register(models.Cart, CartAdminHelper)
admin.site.register(models.Certificate)
admin.site.register(models.CompletedLesson)
admin.site.register(models.EnrolledCourse, EnrolledCourseAdminHelper)
admin.site.register(models.Review, ReviewAdminHelper)
admin.site.register(models.Notification)
admin.site.register(models.Wishlist)
admin.site.register(models.CartOrder)
admin.site.register(models.CartOrderItem, CartOrderItemAdminHelper)
admin.site.register(models.Coupon)
admin.site.register(models.Country)
