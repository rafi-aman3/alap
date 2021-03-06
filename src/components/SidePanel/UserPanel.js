import React from "react";
import firebase from "../../firebase";
import { Grid, Header, Icon, Dropdown, Image, Modal, Input, Button } from "semantic-ui-react";
import AvatarEditor from "react-avatar-editor";

class UserPanel extends React.Component {

  state = {
    modal: false,
    previewImage: '',
    croppedImage: '',
    uploadedCroppedImage: '',
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    usersRef: firebase.database().ref('users'),
    blob: '',
    metadata: {
      contentType: 'image/jpeg'
    }
  }

  openModal = () => this.setState({modal: true})
  closeModal = () => this.setState({modal: false})
   
  

  dropdownOptions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong>{this.props.currentUser.displayName}</strong>
        </span>
      ),
      disabled: true
    },
    {
      key: "avatar",
      text: <span onClick={this.openModal}>Change Avatar</span>
    },
    {
      key: "signout",
      text: <span onClick={this.handleSignout}>Sign Out</span>
    }
  ];

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log("signed out!"));
  };

  handleInputChange = event => {
    const file = event.target.files[0]
    const reader = new FileReader()

    if(file) {
      reader.readAsDataURL(file)
      reader.addEventListener('load' , () => {
        this.setState({ previewImage: reader.result})
      })
    }
  }

  handleCropImage = () => {
    if(this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageURL = URL.createObjectURL(blob)
        this.setState({ croppedImage: imageURL,
          blob})
      })
    }

  }

  uploadCropImage = () => {
    const { storageRef, userRef, blob, metadata } = this.state
    storageRef.child(`avatars/user/${userRef.uid}`).put(blob, metadata).then(snap => {
      snap.ref.getDownloadURL().then(downloadURL => {
        this.setState({ uploadedCroppedImage: downloadURL }, () => this.changeAvatar())

      })
    })

  }

  changeAvatar = () => {
    this.state.userRef.updateProfile({
      photoURL: this.state.uploadedCroppedImage
    }).then(() => {
      console.log('PhotoURL updated')
      this.closeModal()
    }).catch(err => {
      console.error(err)
    })

    this.state.usersRef.child(this.props.currentUser.uid).update({ avatar: this.state.uploadedCroppedImage}).then(() => {
      console.log('User Avatar Updated')
    }).catch(err => {
      console.error(err)
    })
  }

  render() {

    const { modal, previewImage, croppedImage } = this.state

    return (
      <Grid style={{ background: "#4c3c4c" }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
            {/* App Header */}
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>Alap</Header.Content>
            </Header>
             {/* User Dropdown  */}
            <Header style={{ padding: "0.25em" }} as="h4" inverted>
            <Dropdown
              trigger={<span>
                   <Image src={this.props.currentUser.photoURL} spaced="right" avatar />
                  {this.props.currentUser.displayName}
                  </span>}
              options={this.dropdownOptions()}
            />
            </Header>
            </Grid.Row>

            <Modal basic open={modal} onClose={this.closeModal}>
              <Modal.Header>
                Change Avatar
              </Modal.Header>
              <Modal.Content>
                <Input
                  fluid
                  onChange={this.handleInputChange}
                  type="file"
                  label="New Avatar"
                  name="previewImage"
                />
                <Grid centered stackable columns={2}>
                  <Grid.Row centered>
                    <Grid.Column className="ui centered aligned grid">
                      { previewImage && (
                        <AvatarEditor ref={node => (this.avatarEditor = node)} image={previewImage} width={120} height={120} border={50} scale={1.2}/>
                      )}
                    </Grid.Column>
                    <Grid.Column>
                      {croppedImage && (
                        <Image
                          style={{margin: '3.5em auto'}}
                          width={100}
                          height={100}
                          src={croppedImage}
                        />
                      )}
                    </Grid.Column>

                  </Grid.Row>

                </Grid>
              </Modal.Content>
              <Modal.Actions>
                { croppedImage && <Button
                  color="green"
                  inverted
                  onClick={this.uploadCropImage}
                >
                  <Icon name="checkmark"/> Change Avatar
                </Button>}
                <Button
                  color="green"
                  inverted
                  onClick={this.handleCropImage}
                >
                  <Icon name="image"/> Preview
                </Button>
                <Button
                  color="red"
                  inverted
                  onClick={this.closeModal}>
                  <Icon name="remove"/> Cancel
                </Button>
              </Modal.Actions>

            </Modal>


         
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
