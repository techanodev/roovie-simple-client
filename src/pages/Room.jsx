import React, { Component } from "react";

import { io } from "socket.io-client";
import {
    Container,
    Form,
    Button,
    FloatingLabel,
    Col,
    Row,
} from "react-bootstrap";

export default class Room extends Component {
    constructor(props) {
        super(props);
        this.state = { time: 0 };
        this.nickname = React.createRef();
        this.room = React.createRef();
        this.isSeeking = true;
        /**
         * @type {React.RefObject<HTMLVideoElement>}
         */
        this.video = React.createRef();
    }

    componentDidMount() {
        this.socket = io("http://192.168.16.100:8000/");
        this.socket.on("time", (time) => {
            if (
                this.video.current &&
                Math.abs(this.video.current.currentTime - time) > 1
            ) {
                this.video.current.currentTime = time;
                this.isSeeking = false;
            }
        });

        this.socket.on("get-time", (time, userId) => {
            this.socket.emit("update-time", time, userId);
        });

        this.socket.on("status", async (status) => {
            if (status) await this.video.current?.play();
            else this.video.current?.pause();
        });

        setInterval(() => {
            if (
                this.nickname.current?.value === "admin" &&
                this.video.current &&
                !this.video.current.paused
            ) {
                const time = this.video.current.currentTime;
                this.socket.emit("time", time, (error) => {
                    console.error(error);
                });
            }
        }, 1000);
    }

    setData() {
        const roomName = this.room.current.value;
        const nickname = this.nickname.current.value;
        this.socket.emit("join", roomName, nickname, (error) => {
            console.error(error);
        });
        console.log(roomName, nickname);
    }

    onSeeking() {
        if (!this.isSeeking) {
            this.isSeeking = true;
            return;
        }
        this.socket.emit("time", this.video.current.currentTime, (error) => {
            console.error(error);
        });
    }

    onPlayStatusChange(status) {
        this.socket.emit("status", status, (error) => {
            console.error(error);
        });
    }

    render() {
        return (
            <Container className="mt-5">
                <form className="mb-3">
                    <Row className="g-3">
                        <Col md>
                            <FloatingLabel
                                controlId="floatingInput"
                                label="Nickname"
                            >
                                <Form.Control ref={this.nickname} />
                            </FloatingLabel>
                        </Col>
                        <Col md>
                            <FloatingLabel
                                controlId="floatingSelectGrid"
                                label="Select room"
                            >
                                <Form.Select
                                    aria-label="Floating label select example"
                                    ref={this.room}
                                >
                                    <option>Select room</option>
                                    <option value="one">Room One</option>
                                    <option value="two">Room Two</option>
                                    <option value="three">Room Three</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                    </Row>
                    <Button className="mt-3" onClick={() => this.setData()}>
                        Set data
                    </Button>
                </form>
                <Row>
                    <Col sm={8}>
                        <video
                            ref={this.video}
                            className="w-100 h-75"
                            src="https://cdn.3rver.org/?s=2&f=/up/Movie/Series/Daddy.Long.Legs/Daddy.Long.Legs.E01.Farsi.Dubbed.HexDL.com.mkv"
                            onPlay={() => this.onPlayStatusChange(true)}
                            onPause={() => this.onPlayStatusChange(false)}
                            onPlaying={(e) => this.onSeeking(e)}
                            controls
                        ></video>
                    </Col>
                    <Col sm={4}>
                        <span>Chat room</span>
                    </Col>
                </Row>
            </Container>
        );
    }
}