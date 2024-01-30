import React, { Component } from 'react';
import Dropzone from 'react-dropzone';

import UploadService from '../services/upload-files.service';

export default class UploadFiles extends Component {
  constructor(props) {
    super(props);
    this.upload = this.upload.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {
      selectedFiles: undefined,
      currentFile: undefined,
      progress: 0,
      message: '',
      fileInfos: [],
    };
  }

  componentDidMount() {
    // UploadService.getFiles().then((response) => {
    //   this.setState({
    //     fileInfos: response.data,
    //   });
    // });
  }

  upload() {
    let currentFile = this.state.selectedFiles[0];

    this.props.uploadFile(currentFile);

    return;

    this.setState({
      progress: 0,
      currentFile: currentFile,
    });

    UploadService.upload(currentFile, (event) => {
      this.setState({
        progress: Math.round((100 * event.loaded) / event.total),
      });
    })
      .then((response) => {
        this.setState({
          message: response.data.message,
        });
        return UploadService.getFiles();
      })
      .then((files) => {
        this.setState({
          fileInfos: files.data,
        });
      })
      .catch(() => {
        this.setState({
          progress: 0,
          message: 'Could not upload the file!',
          currentFile: undefined,
        });
      });

    this.setState({
      selectedFiles: undefined,
    });
  }

  onDrop(files) {
    if (files.length > 0) {
      this.setState({ selectedFiles: files });
    }
  }

  render() {
    const { selectedFiles, currentFile, progress, message, fileInfos } =
      this.state;

    return (
      <div>
        {currentFile && (
          <div className="progress mb-3">
            <div
              className="progress-bar progress-bar-info progress-bar-striped"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ width: progress + '%' }}
            >
              {progress}%
            </div>
          </div>
        )}

        <Dropzone onDrop={this.onDrop} multiple={false}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                {selectedFiles && selectedFiles[0].name ? (
                  <div className="selected-file">
                    {selectedFiles && selectedFiles[0].name}
                  </div>
                ) : (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '70px' }}
                  >
                    cloud_upload
                  </span>
                )}
              </div>
              <aside className="selected-file-wrapper">
                <button
                  className="btn btn-success"
                  disabled={!selectedFiles}
                  onClick={this.upload}
                >
                  Select
                </button>
              </aside>
            </section>
          )}
        </Dropzone>

        <div
          className="alert alert-light hidden"
          role="alert"
          style={{ display: 'none' }}
        >
          {message}
        </div>

        {fileInfos.length > 0 && (
          <div className="card">
            <div className="card-header">List of Files</div>
            <ul className="list-group list-group-flush">
              {fileInfos.map((file, index) => (
                <li className="list-group-item" key={index}>
                  <a href={file.url}>{file.name}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}
