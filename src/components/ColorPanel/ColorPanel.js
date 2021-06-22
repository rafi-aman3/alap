import React from 'react'
import { CirclePicker } from 'react-color'
import { Button, Divider, Menu, Modal, Sidebar, Icon, Segment } from 'semantic-ui-react'
import firebase from '../../firebase'
import { setColor } from '../../actions'
import { connect } from 'react-redux'


class ColorPanel extends React.Component {

    state = {
        modal: false,
        user: this.props.currentUser,
        userRef: firebase.database().ref('users'),
        color: '',
        userColor: []
    }

    componentDidMount () {
        if(this.state.user) {
            this.addListeners(this.state.user.uid)
        }
    }

    componentWillUnmount () {
        this.removeListeners()
    }

    removeListeners = () => {
        this.state.userRef.child(`${this.state.user.uid}/color`).off()
    }

    addListeners = userId => {
        let userColor = []
        this.state.userRef.child(`${userId}/color`).on('child_added', snap => {
            userColor.unshift(snap.val())
            this.setState({ userColor: userColor })
        })
    }

    openModal = () => this.setState({modal: true})
    closeModal = () => this.setState({modal: false})

    handleSaveColor = () => {
        if(this.state.color) {
            this.saveColor(this.state.color)
        }
    }

    saveColor = color => {
        this.state.userRef.child(`${this.state.user.uid}/color`).push().update({ color}).then(() => {
            console.log('color added')
            this.closeModal()
        }).catch(err => console.log(err))

    }



    handleChangeColor = color => this.setState({ color: color.hex})

    displayUserColor = color => (
        color.length > 0 && color.map((clr,i) => (
            <React.Fragment key={i}>
                <Divider/>
                <div className="color__container" onClick={() => this.props.setColor(clr.color)}>
                    <div className="color__square" style={{background: clr.color}}>
                        <div className="color__overlay" style={{background: clr.color}}>

                        </div>

                    </div>

                </div>

            </React.Fragment>
        ))
    )

    render() {

        const {modal, color, userColor } = this.state
        return (
            <Sidebar 
                as={Menu}
                icon="labeled"
                inverted
                visible
                vertical
                width="very thin"

            
            >
                <Divider/>
                <Button icon="add" size="small" color="blue" onClick={this.openModal}/>
                {this.displayUserColor(userColor)}

                <Modal basic open={modal} onClose={this.closeModal}>
                <Modal.Header>Choose App Color</Modal.Header>
                <Modal.Content>
                    <Segment inverted>
                        <CirclePicker color={color} onChange={this.handleChangeColor}/>
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        color="green"
                        inverted
                        onClick={this.handleSaveColor}
                        >
                        <Icon name="checkmark"/> Save Color
                    </Button>
                    <Button
                        color="red"
                        inverted
                        onClick={this.closeModal}>
                        <Icon name="remove"/> Cancel
                    </Button>
                </Modal.Actions>

                </Modal>

            </Sidebar>
        )
    }
}

export default connect(null, { setColor })(ColorPanel) 