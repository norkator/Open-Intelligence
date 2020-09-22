import React, {Component} from "react";
import axios, {GET_FACES_FOR_DAY_PATH} from "../../axios";
import {GenericImageModal, ModalPropsInterface} from "../../components/GenericImageModal/GenericImageModal";
import {
  getObjectDetectionImageFileNameForCroppedImageName,
  getObjectDetectionImage,
  ObjectDetectionImageFileNameInterface,
  ObjectDetectionImageInterface
} from '../../utils/HttpUtils'
import {LoadingIndicator} from "../../components/LoadingIndicator/LoadingIndicator";


interface FacesInterface {
  title: string,
  file: string,
  image: string,
}

class Faces extends Component {
  private _isMounted: boolean;

  state = {
    selectedDay: new Date().toISOString().substr(0, 10),
    faceImages: [] as FacesInterface[],
    intervalId: 0,
    genericImageModalData: {show: false} as ModalPropsInterface,
    isLoading: true,
  };


  constructor(props: any) {
    super(props);
    this._isMounted = false;
  }

  componentDidMount(): void {
    this._isMounted = true;
    this.loadFaceImages(this.state.selectedDay);
    const intervalId = setInterval(() => this.loadFaceImages(this.state.selectedDay), 60 * 1000);
    this.setState({intervalId: intervalId});
  }

  componentWillUnmount(): void {
    clearInterval(this.state.intervalId);
    this._isMounted = false;
  }

  loadEarlierDayHandler = () => {
    let date = new Date(this.state.selectedDay);
    date.setDate(date.getDate() - 1);
    const dateStr = date.toISOString().substr(0, 10);
    this.setSelectedDay(dateStr);
  };

  loadNextDayHandler = () => {
    let date = new Date(this.state.selectedDay);
    date.setDate(date.getDate() + 1);
    const dateStr = date.toISOString().substr(0, 10);
    this.setSelectedDay(dateStr);
  };

  setSelectedDay = (date: string) => {
    this.setState({selectedDay: date});
    this.loadFaceImages(date);
  };

  loadFaceImages = (date: string) => {
    axios.post(GET_FACES_FOR_DAY_PATH, {selectedDate: date}).then((data: any) => {
      if (this._isMounted) {
        this.setState({faceImages: this.removeDuplicates(data.data.images as FacesInterface[]), isLoading: false});
      }
    }).catch(error => {
      console.error(error);
    });
  };

  removeDuplicates = (faces: FacesInterface[]) => {
    return faces.filter(
      (v: FacesInterface, i: number, a: FacesInterface[]) => a.findIndex(
        t => (t.file === v.file)
      ) === i
    );
  };


  async loadObjectDetectionImageHandler(croppedImageName: string) {
    this.setState({isLoading: true});
    const file = await getObjectDetectionImageFileNameForCroppedImageName(croppedImageName) as ObjectDetectionImageFileNameInterface;
    // Todo: implement error handling for null|undefined file with bar functional component + state
    const image = await getObjectDetectionImage(file.file_name) as ObjectDetectionImageInterface;
    // Todo: add error handling here also
    this.setState({
      isLoading: false,
      genericImageModalData: {
        show: true,
        title: image.file_name,
        description: 'Original image file where face is detected',
        src: image.data,
        showBadges: false,
      }
    });
  };

  genericImageModalCloseHandler = () => {
    this.setState({genericImageModalData: {show: false}});
  };

  render() {
    let faces: JSX.Element[] = [];

    if (this.state.faceImages !== undefined) {
      if (this.state.faceImages.length > 0) {
        faces = this.state.faceImages.map(image => {
          return (
            <img
              id={image.file}
              title={image.title}
              className="CursorPointer mr-1 ml-1 mt-1 magictime spaceInLeft"
              style={{maxHeight: '120px', maxWidth: '120px'}}
              key={image.file}
              src={image.image}
              alt={image.file}
              onClick={async () => await this.loadObjectDetectionImageHandler(image.file)}
            />
          )
        });
      }
    }

    return (
      <div>

        <div className="d-flex justify-content-center flex-wrap mb-2 magictime spaceInLeft">
          <div className="input-group mb-2" style={{maxWidth: '300px'}}>
            <input type="text" style={{backgroundColor: '#343a40', color: '#999999'}}
                   disabled className="form-control" value={this.state.selectedDay}/>
            <div className="input-group-append">
              <button className="btn btn-outline-info" type="button" onClick={this.loadEarlierDayHandler}>← Earlier
              </button>
              <button className="btn btn-outline-info" type="button" onClick={this.loadNextDayHandler}>Next →</button>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center flex-wrap">
          {faces}
        </div>

        <GenericImageModal
          closeHandler={() => this.genericImageModalCloseHandler}
          show={this.state.genericImageModalData.show}
          description={this.state.genericImageModalData.description}
          src={this.state.genericImageModalData.src}
          title={this.state.genericImageModalData.title}
          showBadges={this.state.genericImageModalData.showBadges}
          srImage={this.state.genericImageModalData.srImage}
          detectionResult={this.state.genericImageModalData.detectionResult}
          color={this.state.genericImageModalData.color}
          additionalInfo={this.state.genericImageModalData.additionalInfo}
        />

        { /* Handle showing loading indicator */
          this.state.isLoading ? <LoadingIndicator isDark={false} /> : null
        }

      </div>
    )
  }
}


export default Faces;