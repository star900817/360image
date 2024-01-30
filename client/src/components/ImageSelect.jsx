import * as React from 'react';

export default function ImageSelect(props) {
  const images = [
    'pano2.png',
    'pano3.jpg',
    'test (1).jpg',
    'test (2).jpg',
    'test (3).jpg',
  ];

  const onSelectImage = (url) => {
    props.onSelectImage(url);
  };

  return (
    <>
      <div className="row image-panel">
        {images.map((img, i) => (
          <div
            key={i}
            className="col-lg-3 col-md-3 col-sm-4"
            style={{ width: '400px' }}
            onClick={onSelectImage.bind(this, img)}
          >
            <img
              className="btn"
              style={{ width: '100%' }}
              src={`./assets/${img}`}
            />
          </div>
        ))}
      </div>
    </>
  );
}
