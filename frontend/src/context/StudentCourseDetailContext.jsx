import { createContext, useContext, useState } from "react";
import { axiosPrivate } from "../api/axios";
import { useAuthContext } from "./AuthContext";
import Toast from "../utils/Toast";

const StudentCourseDetailContext = createContext();

export const StudentCourseDetailProvider = ({ children }) => {
  const {
    auth: { user },
  } = useAuthContext();
  const [course, setCourse] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [studentReview, setStudentReview] = useState([]);
  const [completionPercent, setCompletionPercent] = useState(0);

  const fetchStudentCourseDetail = async (enrollment_id) => {
    try {
      const res = await axiosPrivate.get(
        `api/student/course-detail/${user?.user_id}/${enrollment_id}/`
      );
      const data = res.data;
      setCourse(data);
      setQuestions(data.question_answer);
      setStudentReview(data.review);

      const completedPercent =
        data.completed_lesson.length * (100 / data.curriculum.length);
      setCompletionPercent(Math.round(completedPercent));
    } catch (err) {
      console.log(err);
    }
  };

  const markAsCompleted = async (variantItemId, enrollment_id) => {
    const formData = new FormData();

    formData.append("user_id", user?.user_id);
    formData.append("course_id", course?.course.id);
    formData.append("variant_item_id", variantItemId);
    try {
      const res = await axiosPrivate.post(
        `api/student/course-completed/`,
        formData
      );
      fetchStudentCourseDetail(enrollment_id);
    } catch (err) {
      console.log(err);
    }
  };

  const submitReview = async (review, enrollment_id) => {
    const formDate = new FormData();
    formDate.append("user_id", user?.user_id);
    formDate.append("course_id", course?.course.id);
    formDate.append("rating", review.rating);
    formDate.append("review", review.review);

    try {
      const res = axiosPrivate.post(`api/student/rate-course/`, formDate);
      Toast().fire({
        icon: "success",
        title: "Review created",
      });
      fetchStudentCourseDetail(enrollment_id);
    } catch (error) {
      console.log(error);
    }
  };

  const removeReview = async (review, enrollment_id) => {
    try {
      const res = await axiosPrivate.delete(
        `api/student/review-detail/${user?.user_id}/${review.id}/`
      );
      Toast().fire({
        icon: "success",
        title: "Review deleted",
      });
      fetchStudentCourseDetail(enrollment_id);
    } catch (error) {
      console.log(error);
    }
  };

  const editReview = async (review, enrollment_id) => {
    const formData = new FormData();
    formData.append("review", review.review);
    formData.append("rating", review.rating);

    try {
      const res = axiosPrivate.patch(
        `api/student/review-detail/${user?.user_id}/${review.id}/`,
        formData
      );
      Toast().fire({
        icon: "success",
        title: "Review edited",
      });
      fetchStudentCourseDetail(enrollment_id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <StudentCourseDetailContext.Provider
      value={{
        fetchStudentCourseDetail,
        markAsCompleted,
        submitReview,
        removeReview,
        editReview,
        course,
        questions,
        studentReview,
        completionPercent,
      }}
    >
      {children}
    </StudentCourseDetailContext.Provider>
  );
};

export const useStudentCourseDetailContext = () => {
  return useContext(StudentCourseDetailContext);
};
