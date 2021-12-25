import React, { Component } from "react";

import { io } from "socket.io-client";
import {
    Container,
    Form,
    Button,
    FloatingLabel,
    Col,
    Row,
    Badge,
    Tab,
    Tabs,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

export default class Room extends Component {
    constructor(props) {
        super(props);
        this.state = { users: [] };
        this.nickname = React.createRef();
        this.room = React.createRef();
        this.isSeeking = true;
        this.isChangingStatus = false;
        /**
         * @type {React.RefObject<HTMLVideoElement>}
         */
        this.video = React.createRef();
    }

    componentDidMount() {
        this.socket = io("http://192.168.16.101:8080/", {
            auth: {
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjM3MzI3NTg1LCJleHAiOjE2NTI4Nzk1ODV9.HLChj5kDpsdykcieexTBkXlt8gxQa6IIubYXBMUmFaA",
            },
        });
        this.socket.on("time", (time) => {
            if (
                this.video.current &&
                Math.abs(this.video.current.currentTime - time) > 0.5
            ) {
                this.video.current.currentTime = time;
                this.isSeeking = false;
            }
        });

        this.socket.on("status", async (status) => {
            this.isChangingStatus = true;
            if (status) await this.video.current?.play();
            else this.video.current?.pause();
        });

        this.socket.on("users", (users) => {
            this.setState({ users: users });
        });

        this.socket.on("notification", (msg, type) => {
            toast(msg, { type: type });
        });

        setInterval(() => {
            if (
                this.isAdmin() &&
                this.video.current &&
                !this.video.current.paused
            ) {
                const time = this.video.current.currentTime;
                this.socket.emit("time", time, (error) => {
                    toast.error(error);
                });
            }
        }, 1000);
    }

    isAdmin() {
        const index = this.state.users
            .map((x) => x.nickname)
            .indexOf(this.nickname.current?.value);
        return index === 0;
    }

    setData(e) {
        e.preventDefault();
        const roomName = this.room.current.value;
        const nickname = this.nickname.current.value;
        this.socket.emit("join", roomName, nickname, (error) => {
            toast.error(error);
        });
    }

    onSeeking() {
        if (!this.isSeeking) {
            this.isSeeking = true;
            return;
        }
        this.socket.emit("time", this.video.current.currentTime, (error) => {
            toast.error(error);
        });
    }

    onPlayStatusChange(status) {
        if (this.isChangingStatus) {
            this.isChangingStatus = false;
            return;
        }
        this.socket.emit("status", status, (error) => {
            toast.error(error);
        });
        this.socket.emit("time", this.video.current.currentTime, (error) => {
            toast.error(error);
        });
    }

    render() {
        return (
            <Container className="mt-5">
                <form className="mb-3" onSubmit={(e) => this.setData(e)}>
                    <Row className="g-3">
                        <Col md>
                            <FloatingLabel
                                controlId="floatingInput"
                                label="نام نمایشی"
                            >
                                <Form.Control ref={this.nickname} required />
                            </FloatingLabel>
                        </Col>
                        <Col md>
                            <FloatingLabel
                                controlId="floatingSelectGrid"
                                label="اتاق خود را انتخاب نمایید"
                            >
                                <Form.Select
                                    aria-label="Floating label select example"
                                    ref={this.room}
                                    required
                                >
                                    <option value="one">اتاق شماره ۱</option>
                                    <option value="two">اتاق شماره ۲</option>
                                    <option value="three">اتاق شماره ۳</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                    </Row>
                    <Button className="mt-3" type="submit">
                        تایید اطلاعات
                    </Button>
                </form>
                <Row>
                    <Col sm={8}>
                        <video
                            ref={this.video}
                            className="w-100 h-100"
                            src="http://192.168.16.101:8888/V%20for%20Vendetta%202005/V%20for%20Vendetta%202005.mkv"
                            onPlay={() => this.onPlayStatusChange(true)}
                            onPause={() => this.onPlayStatusChange(false)}
                            onPlaying={(e) => this.onSeeking(e)}
                            controls
                        ></video>
                    </Col>
                    <Col sm={4} className="bg-light rounded pl-2 pr-2 h-75">
                        <Tabs
                            defaultActiveKey="profile"
                            id="uncontrolled-tab-example"
                            className="mb-3"
                        >
                            <Tab eventKey="home" title="افراد">
                                <div className="mb-2">افراد آنلاین در اتاق</div>
                            </Tab>
                            <Tab eventKey="profile" title="گفتگو">
                                <div>
                                    {this.state.users.map((user, index) => (
                                        <>
                                            <Badge
                                                bg={
                                                    user.nickname ===
                                                    this.nickname.current.value
                                                        ? "success"
                                                        : "secondary"
                                                }
                                                className="mb-2 rounded"
                                            >
                                                {index === 0 && (
                                                    <>
                                                        <FontAwesomeIcon
                                                            icon={faCrown}
                                                        />{" "}
                                                    </>
                                                )}
                                                {user.nickname}
                                            </Badge>{" "}
                                        </>
                                    ))}
                                </div>
                            </Tab>
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        );
    }
}
