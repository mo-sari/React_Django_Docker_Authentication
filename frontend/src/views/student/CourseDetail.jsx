import React, { useEffect, useState } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import ReactPlayer from "react-player";
import { FaPlay } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { CgFolderRemove } from "react-icons/cg";
import moment from "moment";
import Toast from "../../utils/Toast";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useParams } from "react-router-dom";
import { useStudentCourseDetailContext } from "../../context/StudentCourseDetailContext";
import { axiosPrivate } from "../../api/axios";
import { useAuthContext } from "../../context/AuthContext";

function CourseDetail() {
  const {
    auth: { user },
  } = useAuthContext();
  const { enrollment_id } = useParams();

  const {
    fetchStudentCourseDetail,
    markAsCompleted,
    submitReview,
    removeReview,
    editReview,
    course,
    questions,
    studentReview,
    completionPercent,
  } = useStudentCourseDetailContext();

  useEffect(() => {
    fetchStudentCourseDetail(enrollment_id);
  }, [enrollment_id]);

  console.log(questions);

  // =========================================================================
  // Discussion part

  // =========================================================================
  // video playing part
  const [variantItem, setVariantItem] = useState(null);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = (l) => {
    setShow(true);
    setVariantItem(l);
  };
  //   ============================================================
  //   Question's part

  const [replyingComment, setReplyingComment] = useState(null);

  const [comment, setComment] = useState("");
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    message: "",
  });

  const handleCreateQuestion = (e) => {
    setNewQuestion({
      ...newQuestion,
      [e.target.name]: e.target.value,
    });
  };

  const removeQuestionAnswer = async (e, id) => {
    e.preventDefault();
    try {
      await axiosPrivate.delete(
        `api/student/question-answer-delete/${user?.user_id}/${id}/`
      );
      Toast().fire({
        icon: "success",
        title: "Discussion Deleted",
      });
      fetchStudentCourseDetail(enrollment_id);
    } catch (error) {
      console.log(error);
    }
  };

  const removeQuesetionAnswerMessage = async (e, id) => {
    e.preventDefault();
    try {
      await axiosPrivate.delete(
        `/api/student/question-answer-message-update-delete/${user?.user_id}/${id}/`
      );
      Toast().fire({
        icon: "success",
        title: "Comment Deleted",
      });
      fetchStudentCourseDetail(enrollment_id);
    } catch (error) {
      console.log(error);
    }
  };

  const createQuestionAnswer = async (e, course) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("course_id", course?.id);
    formData.append("user_id", user?.user_id);
    formData.append("title", newQuestion.title);
    formData.append("message", newQuestion.message);
    try {
      await axiosPrivate.post(
        `/api/student/question-answer-list-create/${course?.id}/`,
        formData
      );
      Toast().fire({
        icon: "success",
        title: "Discussion Created",
      });
      fetchStudentCourseDetail(enrollment_id);
    } catch (error) {
      console.log(error);
    } finally {
      setNewQuestion({
        title: "",
        message: "",
      });
    }
  };

  const createQuesetionAnswerMessage = async (e, id) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("course_id", course?.id);
    formData.append("qa_id", id);
    formData.append("user_id", user?.user_id);
    formData.append("message", comment);
    try {
      await axiosPrivate.post(
        `api/student/question-answer-message-create/`,
        formData
      );
      Toast().fire({
        icon: "success",
        title: "Comment Created",
      });
      fetchStudentCourseDetail(enrollment_id);
    } catch (error) {
      console.log(error);
    } finally {
      setComment("");
      setReplyingComment(null);
    }
  };

  // ==========================================================================
  // review part

  const [isReviewEditMode, setIsReviewEditMode] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [review, setReview] = useState({
    rating: 1,
    review: "",
  });

  const handleReview = (e) => {
    setReview({
      ...review,
      [e.target.name]: e.target.value,
    });
  };

  const reviewCreate = (e) => {
    setIsReviewEditMode(false);
    handleCreateReview(e);
  };

  const reviewUpdate = (oldReview) => {
    setIsReviewEditMode(true);
    setReview({
      rating: oldReview.rating,
      review: oldReview.review,
    });
    setSelectedReviewId(oldReview.id);
  };

  const reviewRoutine = () => {
    setReview({
      rating: 1,
      review: "",
    });
    setIsReviewEditMode(false);
    setSelectedReviewId(null);
  };

  const handleCreateReview = (e) => {
    e.preventDefault();

    submitReview(review, enrollment_id);
    reviewRoutine();
  };

  const handleUpdateReview = (e) => {
    e.preventDefault();
    review.id = selectedReviewId;

    editReview(review, enrollment_id);
    reviewRoutine();
  };

  return (
    <>
      <BaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          {/* Header Here */}
          <Header />
          <div className="row mt-0 mt-md-4">
            {/* Sidebar Here */}
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <section className="mt-4">
                <div className="container">
                  <div className="row">
                    {/* Main content START */}
                    <div className="col-12">
                      <div className="card shadow rounded-2 p-0 mt-n5">
                        {/* Tabs START */}
                        <div className="card-header border-bottom px-4 pt-3 pb-0">
                          <ul
                            className="nav nav-bottom-line py-0"
                            id="course-pills-tab"
                            role="tablist"
                          >
                            {/* Tab item */}
                            <li
                              className="nav-item me-2 me-sm-4"
                              role="presentation"
                            >
                              <button
                                className="nav-link mb-2 mb-md-0 active"
                                id="course-pills-tab-1"
                                data-bs-toggle="pill"
                                data-bs-target="#course-pills-1"
                                type="button"
                                role="tab"
                                aria-controls="course-pills-1"
                                aria-selected="true"
                              >
                                Course Lectures
                              </button>
                            </li>
                            {/* Tab item */}
                            <li
                              className="nav-item me-2 me-sm-4"
                              role="presentation"
                            >
                              <button
                                className="nav-link mb-2 mb-md-0"
                                id="course-pills-tab-3"
                                data-bs-toggle="pill"
                                data-bs-target="#course-pills-3"
                                type="button"
                                role="tab"
                                aria-controls="course-pills-3"
                                aria-selected="false"
                              >
                                Discussion
                              </button>
                            </li>

                            <li
                              className="nav-item me-2 me-sm-4"
                              role="presentation"
                            >
                              <button
                                className="nav-link mb-2 mb-md-0"
                                id="course-pills-tab-4"
                                data-bs-toggle="pill"
                                data-bs-target="#course-pills-4"
                                type="button"
                                role="tab"
                                aria-controls="course-pills-4"
                                aria-selected="false"
                              >
                                Leave a Review
                              </button>
                            </li>
                          </ul>
                        </div>
                        {/* Tabs END */}
                        {/* Tab contents START */}
                        <div className="card-body p-sm-4">
                          <div
                            className="tab-content"
                            id="course-pills-tabContent"
                          >
                            {/* Content START */}
                            <div
                              className="tab-pane fade show active"
                              id="course-pills-1"
                              role="tabpanel"
                              aria-labelledby="course-pills-tab-1"
                            >
                              {/* Accordion START */}
                              <div
                                className="accordion accordion-icon accordion-border"
                                id="accordionExample2"
                              >
                                <div className="progress mb-3">
                                  <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{ width: `${completionPercent}%` }}
                                    aria-valuenow={completionPercent}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  >
                                    {completionPercent}%
                                  </div>
                                </div>
                                {/* Item */}
                                {course?.curriculum?.map((c, index) => (
                                  <div
                                    className="accordion-item mb-3 p-3 bg-light"
                                    key={c.variant_id}
                                  >
                                    <h6
                                      className="accordion-header font-base"
                                      id="heading-1"
                                    >
                                      <button
                                        className="accordfion-button p-3 w-100 bg-light btn border fw-bold rounded d-sm-flex d-inline-block collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapse-${c.variant_id}`}
                                        aria-expanded="true"
                                        aria-controls={`collapse-${c.variant_id}`}
                                      >
                                        {c.title}
                                        <span className="small ms-0 ms-sm-2">
                                          ({c.variant_items?.length} Lecture
                                          {c.variant_items?.length > 1 && "s"})
                                        </span>
                                      </button>
                                    </h6>

                                    <div
                                      id={`collapse-${c.variant_id}`}
                                      className="accordion-collapse collapse show"
                                      aria-labelledby="heading-1"
                                      data-bs-parent="#accordionExample2"
                                    >
                                      <div className="accordion-body mt-3">
                                        {/* Course lecture */}
                                        {c.variant_items?.map((l, index) => (
                                          <>
                                            <div
                                              key={l.variant_item_id}
                                              className="d-flex justify-content-between align-items-center"
                                            >
                                              <div className="position-relative d-flex align-items-center">
                                                <button
                                                  onClick={() => handleShow(l)}
                                                  className="btn btn-danger-soft btn-round btn-sm mb-0 stretched-link position-static"
                                                >
                                                  <FaPlay />
                                                </button>
                                                <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-100px w-sm-200px w-md-400px">
                                                  {l.title}
                                                </span>
                                              </div>
                                              <div className="d-flex">
                                                <p className="mb-0">
                                                  {l.content_duration ||
                                                    "0m 0s"}
                                                </p>
                                                <input
                                                  type="checkbox"
                                                  className="form-check-input ms-2"
                                                  name=""
                                                  id=""
                                                  onChange={() =>
                                                    markAsCompleted(
                                                      l.variant_item_id
                                                    )
                                                  }
                                                  checked={course.completed_lesson?.some(
                                                    (cl) =>
                                                      cl.variant_item.id ===
                                                      l.id
                                                  )}
                                                />
                                              </div>
                                            </div>
                                            <hr />
                                          </>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {/* Accordion END */}
                            </div>
                            {/* ==========START OF DISCUSSION======== */}
                            <div
                              className="tab-pane fade"
                              id="course-pills-3"
                              role="tabpanel"
                              aria-labelledby="course-pills-tab-3"
                            >
                              <div className="card">
                                {/* Card header */}
                                <div className="card-header border-bottom p-0 pb-3">
                                  {/* Title */}
                                  <h4 className="mb-3 p-3">Discussion</h4>
                                  <form
                                    onSubmit={(e) =>
                                      createQuestionAnswer(e, course)
                                    }
                                    className="row g-4 p-3"
                                  >
                                    {/* Search */}
                                    <div className="col-sm-6 col-lg-9">
                                      <div className="position-relative">
                                        <input
                                          className="form-control pe-5 bg-transparent"
                                          type="text"
                                          placeholder="Title"
                                          name="title"
                                          value={newQuestion.title}
                                          onChange={(e) =>
                                            handleCreateQuestion(e)
                                          }
                                        />
                                        <textarea
                                          placeholder="Ask your question"
                                          className="form-control pe-5 bg-transparent mt-2"
                                          name="message"
                                          value={newQuestion.message}
                                          onChange={(e) =>
                                            handleCreateQuestion(e)
                                          }
                                        />
                                      </div>
                                    </div>
                                    <div className="col-sm-6 col-lg-3">
                                      <button className="btn btn-primary mb-0 w-100">
                                        Ask Question
                                      </button>
                                    </div>
                                  </form>
                                </div>
                                {/* Card body */}
                                <div className="card-body p-0 pt-3">
                                  <div className="vstack gap-3 p-3">
                                    {/* Question item START */}
                                    {/* ===================================== */}
                                    {questions?.map((qa, index) => {
                                      return (
                                        <div
                                          className="shadow rounded-3 p-3 mb-4"
                                          key={index}
                                        >
                                          {/* Question Header */}
                                          <div className="d-sm-flex justify-content-sm-between mb-3">
                                            <div className="d-flex align-items-center">
                                              <div className="avatar avatar-sm flex-shrink-0">
                                                <img
                                                  src={
                                                    qa.messages[0].profile
                                                      ?.image
                                                  }
                                                  className="avatar-img rounded-circle"
                                                  alt="avatar"
                                                  style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                  }}
                                                />
                                              </div>
                                              <div className="ms-2">
                                                <h6 className="mb-0">
                                                  <a
                                                    href="#"
                                                    className="text-decoration-none text-dark"
                                                  >
                                                    {qa.messages[0].user?.name}
                                                  </a>
                                                </h6>
                                                <small>
                                                  {moment(
                                                    qa.messages[0].date
                                                  ).format("DD MMM, YYYY")}
                                                </small>
                                              </div>
                                            </div>
                                            {/* Edit and Delete Icons */}
                                            {user?.user_id === qa.user && (
                                              <div>
                                                <button className="btn btn-sm ">
                                                  <CgFolderRemove
                                                    onClick={(e) =>
                                                      removeQuestionAnswer(
                                                        e,
                                                        qa.id
                                                      )
                                                    }
                                                    style={{
                                                      width: "30px",
                                                      height: "30px",
                                                      color: "lightcoral",
                                                    }}
                                                  />
                                                </button>
                                              </div>
                                            )}
                                          </div>

                                          {/* Question Text */}
                                          <h4>{qa.title}</h4>
                                          <h5>{qa.messages[0].message}</h5>

                                          {/* Join Conversation Button */}

                                          {replyingComment &&
                                          replyingComment.id === qa.id ? (
                                            <form
                                              onSubmit={(e) =>
                                                createQuesetionAnswerMessage(
                                                  e,
                                                  qa.qa_id
                                                )
                                              }
                                              className="row g-4 p-3"
                                            >
                                              {/* Search */}
                                              <div className="col-sm-6 col-lg-9">
                                                <div className="position-relative">
                                                  <textarea
                                                    placeholder="Ask your question"
                                                    className="form-control pe-5 bg-transparent"
                                                    name="comment"
                                                    value={comment}
                                                    onChange={(e) =>
                                                      setComment(e.target.value)
                                                    }
                                                  />
                                                </div>
                                              </div>
                                              <div className="col-sm-6 col-lg-3">
                                                <button className="btn btn-primary mb-0 w-100">
                                                  Add Response
                                                </button>
                                              </div>
                                            </form>
                                          ) : (
                                            <button
                                              onClick={() =>
                                                setReplyingComment(qa)
                                              }
                                              className="btn btn-primary btn-sm mb-3 mt-3"
                                            >
                                              Join Conversation{" "}
                                              <i className="fas fa-arrow-right"></i>
                                            </button>
                                          )}
                                          {qa.messages
                                            .slice(1)
                                            .map((qam, index) => {
                                              return (
                                                <div
                                                  className="ms-4"
                                                  key={qam.id}
                                                >
                                                  {/* Single Answer */}
                                                  <div className="shadow-sm p-3 rounded bg-light mb-3">
                                                    {/* Answer Header */}
                                                    <div className="d-flex align-items-center">
                                                      <div className="avatar avatar-sm flex-shrink-0">
                                                        <img
                                                          src={
                                                            qam?.profile?.image
                                                          }
                                                          className="avatar-img rounded-circle"
                                                          alt="avatar"
                                                          style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                          }}
                                                        />
                                                      </div>
                                                      <div className="ms-2">
                                                        <h6 className="mb-0">
                                                          <a
                                                            href="#"
                                                            className="text-decoration-none text-dark"
                                                          >
                                                            {qam?.user?.name}
                                                          </a>
                                                        </h6>
                                                        <small>
                                                          {moment(
                                                            qam?.date
                                                          ).format(
                                                            "DD MMM, YYYY"
                                                          )}
                                                        </small>
                                                        {qam.user.id ===
                                                          user?.user_id && (
                                                          <button className="btn btn-sm ">
                                                            <CgFolderRemove
                                                              onClick={(e) =>
                                                                removeQuesetionAnswerMessage(
                                                                  e,
                                                                  qam.id
                                                                )
                                                              }
                                                              style={{
                                                                width: "30px",
                                                                height: "30px",
                                                                color:
                                                                  "lightcoral",
                                                                position:
                                                                  "absolute",
                                                                right: "40",
                                                                top: "470",
                                                              }}
                                                            />
                                                          </button>
                                                        )}
                                                      </div>
                                                    </div>

                                                    {/* Answer Text */}
                                                    <p className="mt-2">
                                                      {qam?.message}
                                                    </p>
                                                  </div>

                                                  {/* Add more answers here */}
                                                </div>
                                              );
                                            })}
                                          {/* Answers Section */}
                                        </div>
                                      );
                                    })}
                                    {/* ===================================== */}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* ==========END OF DISCUSSION========== */}
                            <div
                              className="tab-pane fade"
                              id="course-pills-4"
                              role="tabpanel"
                              aria-labelledby="course-pills-tab-4"
                            >
                              <div className="card">
                                {/* Card header */}
                                <div className="card-header border-bottom p-0 pb-3">
                                  {/* Title */}
                                  <h4 className="mb-3 p-3">Leave a Review</h4>
                                  <div className="mt-2">
                                    <form className="row g-3 p-3">
                                      {/* Rating */}
                                      <div className="col-12 bg-light-input">
                                        <select
                                          id="inputState2"
                                          name="rating"
                                          className="form-select js-choice"
                                          value={review.rating}
                                          onChange={handleReview}
                                        >
                                          <option value={1}>★☆☆☆☆ (1/5)</option>
                                          <option value={2}>★★☆☆☆ (2/5)</option>
                                          <option value={3}>★★★☆☆ (3/5)</option>
                                          <option value={4}>★★★★☆ (4/5)</option>
                                          <option value={5}>★★★★★ (5/5)</option>
                                        </select>
                                      </div>
                                      {/* Message */}
                                      <div className="col-12 bg-light-input">
                                        <textarea
                                          className="form-control"
                                          id="exampleFormControlTextarea1"
                                          placeholder="Your review"
                                          rows={3}
                                          name="review"
                                          value={review.review}
                                          onChange={handleReview}
                                        />
                                      </div>
                                      {/* Button */}
                                      <div className="col-12">
                                        {isReviewEditMode ? (
                                          <button
                                            type="submit"
                                            className="btn btn-primary mb-0"
                                            onClick={handleUpdateReview}
                                          >
                                            Edit Review
                                          </button>
                                        ) : (
                                          <button
                                            type="submit"
                                            className="btn btn-primary mb-0"
                                            onClick={reviewCreate}
                                          >
                                            Post Review
                                          </button>
                                        )}
                                      </div>
                                    </form>
                                    {/* Start Of The Review */}
                                    <div className="container text-body">
                                      <div className="row d-flex justify-content-center">
                                        {studentReview.map((r) => {
                                          return (
                                            <div
                                              className="d-flex flex-start mb-4"
                                              key={r.id}
                                            >
                                              <img
                                                className="rounded-circle shadow-1-strong me-3"
                                                src={r?.profile?.image}
                                                alt="avatar"
                                                width="65"
                                                height="65"
                                              />
                                              <div className="card flex-grow-1">
                                                <div className="card-body p-4">
                                                  <div className="">
                                                    <h5>
                                                      {r?.user.name}
                                                      <span
                                                        style={{
                                                          color: "gold",
                                                        }}
                                                      >
                                                        <svg
                                                          xmlns="http://www.w3.org/2000/svg"
                                                          viewBox="0 0 1792 1792"
                                                          width="15"
                                                          height="15"
                                                          style={{
                                                            marginLeft: "10px",
                                                            marginRight: "5px",
                                                          }}
                                                        >
                                                          <path
                                                            fill="currentColor"
                                                            d="M1728 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 49-41t49 41l225 455 502 73q56 9 56 46z"
                                                          ></path>
                                                        </svg>
                                                        {r.rating}
                                                      </span>
                                                    </h5>

                                                    <p className="small">
                                                      {moment(r.date).format(
                                                        "DD MMM, YYYY"
                                                      )}
                                                    </p>
                                                    <p className="mb-0">
                                                      {r.review}
                                                    </p>

                                                    <div
                                                      style={{
                                                        display: "flex",
                                                        justifyContent: "end",
                                                      }}
                                                    >
                                                      <div></div>{" "}
                                                      {/* Empty space for spacing */}
                                                      <div>
                                                        <CgFolderRemove
                                                          style={{
                                                            marginRight: "10px",
                                                            width: "30px",
                                                            height: "30px",
                                                            color: "lightcoral",
                                                          }}
                                                          onClick={() =>
                                                            removeReview(
                                                              r,
                                                              enrollment_id
                                                            )
                                                          }
                                                        />

                                                        <FaEdit
                                                          style={{
                                                            width: "30px",
                                                            height: "30px",
                                                            color: "lightgreen",
                                                          }}
                                                          onClick={() =>
                                                            reviewUpdate(r)
                                                          }
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* End Of The Reviews */}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Lecture Modal */}
      <Modal show={show} size="lg" onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Lesson: {variantItem?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReactPlayer
            url={variantItem?.file}
            controls
            playing
            width={"100%"}
            height={"100%"}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={null}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <BaseFooter />
    </>
  );
}

export default CourseDetail;
