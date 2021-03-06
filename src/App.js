import React from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageInputForm from './components/ImageInputForm/ImageInputForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Particles from 'react-particles-js';
import './App.css';

const particlesOptions = {
  particles: {
    number: {
      value: 120,
      density: {
        enable: true,
        value_area: 700
      }
    },
    move: {
      speed: 0.5
    }
  }
}

const initialState = {
  input: '',
  imageURL: '',
  boxes: {},
  route: 'home',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends React.Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  calculateFaceLocation = (data) => {
    // const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const clarifaiFaces = data.outputs[0].data.regions;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    const mapBoxes = clarifaiFaces.map((input) => {
      const face = input.region_info.bounding_box;
      return {
        leftCol: face.left_col * width,
        topRow: face.top_row * height,
        rightCol: width - (face.right_col * width),
        bottomRow: height - (face.bottom_row * height)
      }
    });
    return mapBoxes;
    // return {
    //   leftCol: clarifaiFace.left_col * width,
    //   topRow: clarifaiFace.top_row * height,
    //   rightCol: width - (clarifaiFace.right_col * width),
    //   bottomRow: height - (clarifaiFace.bottom_row * height)
    // }
  }

  displayFaceBox = (boxes) => {
    this.setState({ boxes: boxes });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  onImageSubmit = () => {
    this.setState({ imageURL: this.state.input });
    fetch('https://arcane-sierra-67660.herokuapp.com/imageurl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('https://arcane-sierra-67660.herokuapp.com/image', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(
                Object.assign( //target object, update it with this info.
                  this.state.user, {
                  entries: count
                }))
            }).catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response));
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState);
    }
    this.setState({ route: route });
  }

  userSignedIn = (status) => {
    this.setState({ isSignedIn: status });
  }

  render() {
    const { isSignedIn, imageURL, route, boxes, user } = this.state;
    return (
      <div className="App">
        <Particles
          className='particles'
          params={particlesOptions}
        />
        <Navigation isSignedIn={isSignedIn} userSignedIn={this.userSignedIn} onRouteChange={this.onRouteChange} />
        <Logo onRouteChange={this.onRouteChange} />
        {(route === 'home') &&
          <div>
            <Rank isSignedIn={isSignedIn} name={user.name} entries={user.entries} />
            <ImageInputForm
              isSignedIn={isSignedIn}
              onInputChange={this.onInputChange}
              onImageSubmit={this.onImageSubmit}
            />
            {(isSignedIn) && <FaceRecognition boxes={boxes} imageURL={imageURL} />}
          </div>
        }
        {(route === 'signin') &&
          <Signin loadUser={this.loadUser} userSignedIn={this.userSignedIn} onRouteChange={this.onRouteChange} />
        }
        {(route === 'signout') &&
          <Signin loadUser={this.loadUser} userSignedIn={this.userSignedIn} onRouteChange={this.onRouteChange} />
        }
        {(route === 'register') &&
          <Register loadUser={this.loadUser} userSignedIn={this.userSignedIn} onRouteChange={this.onRouteChange} />
        }

        {/* {(route === 'signin'
          ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          : (route === 'signout'
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
        )} */}
        {/* {route === 'home'
          ? <div>
            <Logo />
            <Rank isSignedIn={isSignedIn} name={user.name} entries={user.entries} />
            <ImageInputForm
              isSignedIn={isSignedIn}
              onInputChange={this.onInputChange}
              onImageSubmit={this.onImageSubmit}
            />
            <FaceRecognition boxes={boxes} imageURL={imageURL} />
          </div>
          : (route === 'signin'
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            : (route === 'signout'
              ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            )
          )
        } */}
      </div>
    );
  }

}

export default App;
