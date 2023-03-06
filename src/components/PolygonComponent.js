import React, { useEffect, useState } from 'react';
import { Stage, Layer, RegularPolygon } from 'react-konva';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, Row, Col, Table } from 'react-bootstrap';

import axios from "axios";

const getApi = 'http://localhost:5000/polygons'
const postApi = 'http://localhost:5000/savepolygons'

const PolygonComponent = () => {
  const [points, setPoints] = useState([]);
  const [name, setName] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [inputField, setInputField] = useState({
    polygonName: '',
    additionalInfo: '',
  })

  useEffect(() => {
    fetchPolygonDetails();
  }, [])

  const handleMouseDown = (e) => {
    const point = [e.evt.clientX, e.evt.clientY];
    if (!selectedPoints.length) {
      console.log('points', point);
      if (points.length > 0 && point[0] === points[0][0] && point[1] === points[0][1]) {
        setPoints([]);
      } else {
        setPoints([...points, point]);
      }
    } else {
      const index = e.target.index;
      const x = e.target.x();
      const y = e.target.y();
      const newPoints = [...selectedPoints, point];
      newPoints[index] = x;
      newPoints[index + 1] = y;
      setSelectedPoints(newPoints);
    }
  };

  const handleSave = async () => {
    // Save the polygon with metadata
    try {
      console.log('Polygon Name:', name);
      console.log('Additional Info:', additionalInfo);
      console.log('Polygon Points:', points);
      const payload = {
        polygonName: inputField.polygonName,
        additionalInfo: inputField.additionalInfo,
        points: !points.length ? selectedPoints : points
      }

      const results = await axios.post(postApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
      if (results.data) {
        setSuccessMessage(results.data.message);
        fetchPolygonDetails();
        setPoints([]);
        setSelectedPoints([]);
        setInputField({
          polygonName: '',
          additionalInfo: ''
        });
      }
    } catch (error) {
      console.log('error in saving polygon details', error);
    }
  };
  const fetchPolygonDetails = () => {
    try {
      axios.get(getApi).then((response) => {
        if (response.data) {
          setPolygons(response.data);
        }
      });
    } catch (error) {
      console.log('error in fetching polygon details');
    }
  }
  const handleCancel = () => {
    // Cancel the polygon creation
    setPoints([]);
    setSelectedPoints([]);
    setInputField({
      polygonName: '',
      additionalInfo: ''
    });
  };


  const inputHandler = (e) => {
    const { name, value } = e.target;
    setInputField({ ...inputField, [name]: value });
  };


  console.log('selected', selectedPoints)

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-6">
          <Stage width={window.innerWidth} height={500} onMouseDown={handleMouseDown}>
            <Layer>
              {points.length > 1 && (
                <RegularPolygon
                  sides={points.length}
                  x={100}
                  y={150}
                  radius={70}
                  stroke="black"
                  strokeWidth={4}
                  closed
                  points={points.flat()}
                />
              )}
              {selectedPoints.length > 1 && (
                <RegularPolygon
                  sides={selectedPoints.length}
                  x={300}
                  y={150}
                  radius={70}
                  stroke="blue"
                  strokeWidth={4}
                  closed
                  points={selectedPoints.flat()}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6 mt-5">
          <Form>
            <Form.Group className="mb-3 text-start col-md-6" controlId="formText">
              <Form.Label>Enter polygon name</Form.Label>
              <Form.Control
                type="text"
                value={inputField.polygonName}
                name="polygonName"
                onChange={inputHandler}
                placeholder="Enter Polygon Name" />
            </Form.Group>

            <Form.Group className="mb-3 text-start col-md-6" controlId="formText">
              <Form.Label>Enter additional details</Form.Label>
              <Form.Control
                type="text"
                value={inputField.additionalInfo}
                name="additionalInfo"
                onChange={inputHandler}
                placeholder="Enter additional details" />
            </Form.Group>
            <Form.Group className='col-md-6 text-start' as={Row}>
              <Col sm={{ span: 10 }}>
                <Button variant="primary" onClick={handleSave}>
                  Save
                </Button>{' '}
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </Col>

            </Form.Group>
            <span style={{
              color: 'green ',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>{successMessage}</span>
          </Form>
        </div>
        <div className="col-md-6 mt-5">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Polygon Name</th>
                <th>Additional Info</th>
              </tr>
            </thead>
            <tbody>
              {polygons.map((polygon) => (
                <tr key={polygon._id.$oid}>
                  <td><a href="" onClick={(e) => {
                    e.preventDefault();
                    setInputField({
                      polygonName: polygon.polygonName,
                      additionalInfo: polygon.additionalInfo
                    })
                    setSelectedPoints(polygon.points)
                  }}
                  >{polygon.polygonName}</a></td>
                  <td>{polygon.additionalInfo}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PolygonComponent;