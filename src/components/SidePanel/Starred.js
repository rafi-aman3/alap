import React from 'react'
import { Icon, Menu } from 'semantic-ui-react'
import firebase from '../../firebase'
import { setCurrentChannel,setPrivateChannel } from '../../actions'
import { connect } from 'react-redux'


class Starred extends React.Component {

    state ={
        user: this.props.currentUser  ,
        userRef: firebase.database().ref('users'),
        activeChannel: '',
        starredChannels: []
    }

    componentDidMount() {
        if(this.state.user) {
            this.addListeners(this.state.user.uid)
        }
    }

    componentWillUnmount() {
        this.removeListeners()
    }

    removeListeners = () => {
        this.state.userRef.child(`${this.state.user.uid}/starred`).off()
    }
    addListeners = userId => {
        this.state.userRef.child(userId).child('starred').on('child_added', snap => {
            const starredChannel = { id: snap.key, ...snap.val() }
            this.setState({ starredChannels: [...this.state.starredChannels, starredChannel] })
        })

        this.state.userRef.child(userId).child('starred').on('child_removed', snap => {
            const channelToRemove = { id: snap.key, ...snap.val() }
            const filterdChannels = this.state.starredChannels.filter(channel => {
                return channel.id !== channelToRemove.id
            })
            this.setState({ starredChannels: filterdChannels })
        })
    }

    setActiveChannel = channel => {
        this.setState({ activeChannel: channel.id})
    }

    changeChannel = channel => {
        this.setActiveChannel(channel)
        this.props.setCurrentChannel(channel)
        this.props.setPrivateChannel(false)

    }

    displayStarredChannels = starredChannels => (
        starredChannels.length > 0  && starredChannels.map(channel => (
            <Menu.Item key={channel.id} onClick={() => this.changeChannel(channel) } active={channel.id === this.state.activeChannel} name={channel.name} style={{opacity: 0.7}}>
             #{channel.name}
            </Menu.Item>

        ))
    )



    render() {
        const { starredChannels } = this.state
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="star"/> FAVOURITE
                    </span> {" "}
                    ({ starredChannels.length }) 
                </Menu.Item>
                {this.displayStarredChannels(starredChannels)}
            </Menu.Menu>
        )
    }
}

export default connect(null, {  setCurrentChannel, setPrivateChannel })(Starred) 