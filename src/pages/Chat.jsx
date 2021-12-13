import { Component } from "react";
import { Button, FormControl, InputGroup } from "react-bootstrap";

export default class Chat extends Component {
    render() {
        return (
            <>
                <div className="position-absolute top-100 start-100 translate-middle w-75">
                    <InputGroup className="mb-3">
                        <Button variant="outline-secondary" id="button-addon1">
                            Button
                        </Button>
                        <FormControl
                            aria-label="Example text with button addon"
                            aria-describedby="basic-addon1"
                        />
                    </InputGroup>
                </div>
            </>
        );
    }
}
