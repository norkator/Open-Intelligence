import React, {Component} from "react";
import {ReduxPropsInterface} from "../../../store/reducers/dateReducer";
import {Button, Card, Col, Row, Table} from "react-bootstrap";
import {
  addLicensePlate,
  getLicensePlates,
  LicensePlatesInterface, removeLicensePlate, updateLicensePlate
} from "../../../utils/HttpUtils";
import {PlateEditModal, PlateEditModalPropsInterface} from "../../../components/PlateEditModal/PlateEditModal";
import {filterLicensePlate} from "../../../utils/TextUtils";


class Owners extends Component<ReduxPropsInterface> {
  state = {
    totalPlates: 0,
    licensePlates: [] as LicensePlatesInterface[],
    filteredLicensePlates: [] as LicensePlatesInterface[],
    plateEditModalData: {show: false} as PlateEditModalPropsInterface,
  };

  componentDidMount(): void {
    this.loadLicensePlates().then(() => null);
  }

  async loadLicensePlates() {
    const licensePlates = await getLicensePlates() as LicensePlatesInterface[];
    this.setState({
      totalPlates: licensePlates.length,
      licensePlates: licensePlates,
      filteredLicensePlates: licensePlates
    });
  }

  render() {
    let owners: JSX.Element[] = [];

    if (this.state.filteredLicensePlates !== undefined) {
      if (this.state.filteredLicensePlates.length > 0) {
        owners = this.state.filteredLicensePlates.map(licensePlate => {
          return (
            <tr key={licensePlate.id}>
              <td>{licensePlate.id}</td>
              <td>{licensePlate.licence_plate}</td>
              <td>{licensePlate.owner_name}</td>
              <td>
                <Row>
                  <Col>
                    <Button variant="dark" size="sm" className="mr-2" onClick={
                      () => this.editPlateHandler(licensePlate.id, licensePlate.licence_plate, licensePlate.owner_name)
                    }>
                      Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={
                      () => this.plateRemoveHandler(licensePlate.id, licensePlate.licence_plate)
                    }>
                      Remove
                    </Button>
                  </Col>
                </Row>
              </td>
            </tr>
          )
        });
      }
    }

    return (
      <div className="magictime vanishIn">
        <Card bg="Light" text="dark">
          <Card.Header>
            <b>Vehicle owners</b>
          </Card.Header>
          <Card.Body style={{padding: '0px'}}>
            <div className="row">
              <div className="col-sm">
                <input type="text" className="form-control mt-2 mb-2" placeholder="Search filter..."
                       aria-label="Search" onChange={(event: any) => this.onSearchFilterChangeHandler(event)}/>
              </div>
              <div className="col-sm-auto">
                <div>
                  <Button variant="info" className="mt-2 mr-2" onClick={this.addNewPlateHandler}>
                    Add plate
                  </Button>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <Table striped bordered hover variant="light" size="sm" style={{minWidth: '650px'}}>
                <thead>
                <tr>
                  <th>ID</th>
                  <th>Plate</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {owners}
                </tbody>
              </Table>
            </div>
          </Card.Body>
          <Card.Footer>
            <small className="text-muted">Vehicle count: {this.state.totalPlates}</small>
          </Card.Footer>
        </Card>

        <PlateEditModal
          show={this.state.plateEditModalData.show}
          title={this.state.plateEditModalData.title}
          description={this.state.plateEditModalData.description}
          id={this.state.plateEditModalData.id}
          licencePlate={this.state.plateEditModalData.licencePlate}
          ownerName={this.state.plateEditModalData.ownerName}
          closeHandler={() => this.plateEditModalCloseHandler}
          saveHandler={(plateObject: PlateEditModalPropsInterface) => this.plateEditModalSaveHandler(plateObject)}
          lpOnChange={(lp: string) => this.setState({
            plateEditModalData: {
              ...this.state.plateEditModalData,
              licencePlate: filterLicensePlate(lp)
            }
          })}
          ownerOnChange={(owner: string) => this.setState({
            plateEditModalData: {
              ...this.state.plateEditModalData,
              ownerName: owner
            }
          })}
          imageData={undefined}
        />


      </div>
    )
  }

  onSearchFilterChangeHandler = (event: any) => {
    const value = String(event.target.value).toLowerCase();
    const array = this.state.licensePlates.slice(); // Make new copy
    this.setState({
      filteredLicensePlates: array.filter(f => {
        return String(f.licence_plate).toLowerCase().includes(value) || String(f.owner_name).toLowerCase().includes(value);
      })
    });
  };

  addNewPlateHandler = () => {
    this.setState({
      plateEditModalData: {
        show: true,
        title: 'Add new plate',
        description: 'Give new license plate and owner details. License plate can be given with or without "-" character.',
        id: null,
        licencePlate: '',
        ownerName: '',
      }
    });
  };

  editPlateHandler = (id: string, plate: string, owner: string) => {
    this.setState({
      plateEditModalData: {
        show: true,
        title: 'Edit existing plate',
        description: 'You are editing existing license plate item. License plate can be given with or without "-" character.',
        id: id,
        licencePlate: plate,
        ownerName: owner,
      }
    });
  };

  plateEditModalCloseHandler = () => {
    this.setState({plateEditModalData: {show: false}});
  };

  plateEditModalSaveHandler = (plateObject: PlateEditModalPropsInterface) => {
    if (plateObject.id === null) {
      addLicensePlate(plateObject.licencePlate, plateObject.ownerName, 0).then((response: any) => {
        this.loadLicensePlates().then(() => null);
        this.plateEditModalCloseHandler();
      }).catch((error: any) => {
        alert(error);
      });
    } else {
      updateLicensePlate(plateObject.id, plateObject.licencePlate, plateObject.ownerName).then((response: any) => {
        this.loadLicensePlates().then(() => null);
        this.plateEditModalCloseHandler();
      }).catch((error: any) => {
        alert(error);
      });
    }
  };

  plateRemoveHandler = (id: string, lp: string) => {
    // Todo, fix this confirm no-restricted-globals later!
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Delete ' + lp)) {
      removeLicensePlate(id).then((response: any) => {
        this.loadLicensePlates().then(() => null);
      }).catch((error: any) => {
        alert(error);
      });
    }
  }

}

export default Owners;
