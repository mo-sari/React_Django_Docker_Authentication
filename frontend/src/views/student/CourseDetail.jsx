import React, { useEffect, useState } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import ReactPlayer from "react-player";
import { FaPlay } from "react-icons/fa";
import Toast from "../../utils/Toast";
import { FaEdit } from "react-icons/fa";
import { CgFolderRemove } from "react-icons/cg";
import moment from "moment";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useParams } from "react-router-dom";
import { axiosPrivate } from "../../api/axios";
import { useAuthContext } from "../../context/AuthContext";

function CourseDetail() {
  const { enrollment_id } = useParams();
  const {
    auth: { user },
  } = useAuthContext();

  const [course, setCourse] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [studentReview, setStudentReview] = useState([]);
  const [completionPercent, setCompletionPercent] = useState(0);

  const fetchStudentCourseDetail = async () => {
    try {
      const res = await axiosPrivate.get(
        `api/student/course-detail/${user?.user_id}/${enrollment_id}/`
      );
      const data = res.data;
      setCourse(data);
      setQuestions(data.question_answer);
      setStudentReview(data.review);
      console.log(data);

      const completedPercent =
        data.completed_lesson.length * (100 / data.curriculum.length);
      setCompletionPercent(Math.round(completedPercent));
    } catch (err) {
      console.log(err);
    }
  };

  const markAsCompleted = async (variantItemId) => {
    const formData = new FormData();

    formData.append("user_id", user?.user_id);
    formData.append("course_id", course?.course.id);
    formData.append("variant_item_id", variantItemId);
    try {
      const res = await axiosPrivate.post(
        `api/student/course-completed/`,
        formData
      );
      fetchStudentCourseDetail();
    } catch (err) {
      console.log(err);
    }
  };

  const submitReview = async (review) => {
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
      fetchStudentCourseDetail();
    } catch (error) {
      console.log(error);
    }
  };

  const removeReview = async (review) => {
    try {
      const res = await axiosPrivate.delete(
        `api/student/review-detail/${user?.user_id}/${review.id}/`
      );
      Toast().fire({
        icon: "success",
        title: "Review deleted",
      });
      fetchStudentCourseDetail();
    } catch (error) {
      console.log(error);
    }
  };

  const editReview = async (review) => {
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
      fetchStudentCourseDetail();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStudentCourseDetail();
  }, [enrollment_id]);

  // =========================================================================
  // Discussion part
  const [addNewQuestion, setAddNewQuestion] = useState(false);
  const handleNewQuestionClose = () => setAddNewQuestion(false);
  const handleNewQuestionOpen = () => setAddNewQuestion(true);

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

  // =========================================================================
  // video playing part
  const [variantItem, setVariantItem] = useState(null);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = (l) => {
    setShow(true);
    setVariantItem(l);
  };

  // ==========================================================================
  // conversation part
  const [ConversationShow, setConversationShow] = useState(false);
  const handleConversationClose = () => setConversationShow(false);
  const handleConversationShow = () => {
    setConversationShow(true);
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

    submitReview(review);
    reviewRoutine();
  };

  const handleUpdateReview = (e) => {
    e.preventDefault();
    review.id = selectedReviewId;

    editReview(review);
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
              {/* <section className="bg-blue py-7">
                <div className="container">
                  <ReactPlayer url='https://www.youtube.com/watch?v=LXb3EKWsInQ' width={"100%"} height={600} />
                </div>
              </section> */}
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
                                  <form className="row g-4 p-3">
                                    {/* Search */}
                                    <div className="col-sm-6 col-lg-9">
                                      <div className="position-relative">
                                        <input
                                          className="form-control pe-5 bg-transparent"
                                          type="search"
                                          placeholder="Search"
                                          aria-label="Search"
                                        />
                                        <button
                                          className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset"
                                          type="submit"
                                        >
                                          <i className="fas fa-search fs-6 " />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="col-sm-6 col-lg-3">
                                      <a
                                        onChange={handleNewQuestionOpen}
                                        className="btn btn-primary mb-0 w-100"
                                        data-bs-toggle="modal"
                                        data-bs-target="#questionModal"
                                      >
                                        Ask Question
                                      </a>
                                    </div>
                                  </form>
                                </div>
                                {/* Card body */}
                                <div className="card-body p-0 pt-3">
                                  <div className="vstack gap-3 p-3">
                                    {/* Question item START */}
                                    <div className="shadow rounded-3 p-3">
                                      <div className="d-sm-flex justify-content-sm-between mb-3">
                                        <div className="d-flex align-items-center">
                                          <div className="avatar avatar-sm flex-shrink-0">
                                            <img
                                              src="https://geeksui.codescandy.com/geeks/assets/images/avatar/avatar-3.jpg"
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
                                                Angelina Poi
                                              </a>
                                            </h6>
                                            <small>Asked 10 Hours ago</small>
                                          </div>
                                        </div>
                                      </div>
                                      <h5>How can i fix this bug?</h5>
                                      <button
                                        className="btn btn-primary btn-sm mb-3 mt-3"
                                        onClick={handleConversationShow}
                                      >
                                        Join Conversation{" "}
                                        <i className="fas fa-arrow-right"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
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
                                    {/* {studentReview.map((r) => {
                                      return <h6>{r.review}</h6>;
                                    })} */}
                                    {/* Start Of The Review */}
                                    <div className="container text-body">
                                      <div className="row d-flex justify-content-center">
                                        {studentReview.map((r) => {
                                          return (
                                            <div className="d-flex flex-start mb-4">
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
                                                            color: "grey",
                                                          }}
                                                          onClick={() =>
                                                            removeReview(r)
                                                          }
                                                        />

                                                        <FaEdit
                                                          style={{
                                                            width: "30px",
                                                            height: "30px",
                                                            color: "grey",
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

      {/* Question Modal */}
      <Modal
        id="questionModal"
        show={addNewQuestion}
        size="lg"
        onHide={handleNewQuestionClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Ask Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">
                Question Title
              </label>
              <input
                value={newQuestion.title}
                name="title"
                onChange={handleCreateQuestion}
                type="text"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputPassword1" className="form-label">
                Question Message
              </label>
              <textarea
                value={newQuestion.message}
                name="message"
                onChange={handleCreateQuestion}
                className="form-control"
                cols="30"
                rows="10"
              ></textarea>
            </div>
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={handleNewQuestionClose}
            >
              <i className="fas fa-arrow-left"></i> Close
            </button>
            <button type="submit" className="btn btn-primary">
              Send Message <i className="fas fa-check-circle"></i>
            </button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Conversation Edit Modal */}
      <Modal show={ConversationShow} size="lg" onHide={handleConversationClose}>
        <Modal.Header closeButton>
          <Modal.Title>Lesson: 123</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="border p-2 p-sm-4 rounded-3">
            <ul
              className="list-unstyled mb-0"
              style={{ overflowY: "scroll", height: "500px" }}
            >
              <li className="comment-item mb-3">
                <div className="d-flex">
                  <div className="avatar avatar-sm flex-shrink-0">
                    <a href="#">
                      <img
                        className="avatar-img rounded-circle"
                        src="https://geeksui.codescandy.com/geeks/assets/images/avatar/avatar-3.jpg"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                        alt=""
                      />
                    </a>
                  </div>
                  <div className="ms-2">
                    {/* Comment by */}
                    <div className="bg-light p-3 rounded w-100">
                      <div className="d-flex w-100 justify-content-center">
                        <div className="me-2 ">
                          <h6 className="mb-1 lead fw-bold">
                            <a
                              href="#!"
                              className="text-decoration-none text-dark"
                            >
                              {" "}
                              Louis Ferguson{" "}
                            </a>
                            <br />
                            <span style={{ fontSize: "12px", color: "gray" }}>
                              5hrs Ago
                            </span>
                          </h6>
                          <p className="mb-0 mt-3  ">
                            Removed demands expense account
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <li className="comment-item mb-3">
                <div className="d-flex">
                  <div className="avatar avatar-sm flex-shrink-0">
                    <a href="#">
                      <img
                        className="avatar-img rounded-circle"
                        src="https://geeksui.codescandy.com/geeks/assets/images/avatar/avatar-3.jpg"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                        alt=""
                      />
                    </a>
                  </div>
                  <div className="ms-2">
                    {/* Comment by */}
                    <div className="bg-light p-3 rounded w-100">
                      <div className="d-flex w-100 justify-content-center">
                        <div className="me-2 ">
                          <h6 className="mb-1 lead fw-bold">
                            <a
                              href="#!"
                              className="text-decoration-none text-dark"
                            >
                              {" "}
                              Louis Ferguson{" "}
                            </a>
                            <br />
                            <span style={{ fontSize: "12px", color: "gray" }}>
                              5hrs Ago
                            </span>
                          </h6>
                          <p className="mb-0 mt-3  ">
                            Removed demands expense account from the debby
                            building in a hall town tak with
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <li className="comment-item mb-3">
                <div className="d-flex">
                  <div className="avatar avatar-sm flex-shrink-0">
                    <a href="#">
                      <img
                        className="avatar-img rounded-circle"
                        src="https://geeksui.codescandy.com/geeks/assets/images/avatar/avatar-3.jpg"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                        alt=""
                      />
                    </a>
                  </div>
                  <div className="ms-2">
                    {/* Comment by */}
                    <div className="bg-light p-3 rounded w-100">
                      <div className="d-flex w-100 justify-content-center">
                        <div className="me-2 ">
                          <h6 className="mb-1 lead fw-bold">
                            <a
                              href="#!"
                              className="text-decoration-none text-dark"
                            >
                              {" "}
                              Louis Ferguson{" "}
                            </a>
                            <br />
                            <span style={{ fontSize: "12px", color: "gray" }}>
                              5hrs Ago
                            </span>
                          </h6>
                          <p className="mb-0 mt-3  ">
                            Removed demands expense account
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <li className="comment-item mb-3">
                <div className="d-flex">
                  <div className="avatar avatar-sm flex-shrink-0">
                    <a href="#">
                      <img
                        className="avatar-img rounded-circle"
                        src="https://geeksui.codescandy.com/geeks/assets/images/avatar/avatar-3.jpg"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                        alt=""
                      />
                    </a>
                  </div>
                  <div className="ms-2">
                    {/* Comment by */}
                    <div className="bg-light p-3 rounded w-100">
                      <div className="d-flex w-100 justify-content-center">
                        <div className="me-2 ">
                          <h6 className="mb-1 lead fw-bold">
                            <a
                              href="#!"
                              className="text-decoration-none text-dark"
                            >
                              {" "}
                              Louis Ferguson{" "}
                            </a>
                            <br />
                            <span style={{ fontSize: "12px", color: "gray" }}>
                              5hrs Ago
                            </span>
                          </h6>
                          <p className="mb-0 mt-3  ">
                            Removed demands expense account
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>

            <form className="w-100 d-flex">
              <textarea
                name="message"
                className="one form-control pe-4 bg-light w-75"
                id="autoheighttextarea"
                rows="2"
                placeholder="What's your question?"
              ></textarea>
              <button className="btn btn-primary ms-2 mb-0 w-25" type="button">
                Post <i className="fas fa-paper-plane"></i>
              </button>
            </form>

            <form className="w-100">
              <input
                name="title"
                type="text"
                className="form-control mb-2"
                placeholder="Question Title"
              />
              <textarea
                name="message"
                className="one form-control pe-4 mb-2 bg-light"
                id="autoheighttextarea"
                rows="5"
                placeholder="What's your question?"
              ></textarea>
              <button className="btn btn-primary mb-0 w-25" type="button">
                Post <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </Modal.Body>
      </Modal>
      <BaseFooter />
    </>
  );
}

export default CourseDetail;
