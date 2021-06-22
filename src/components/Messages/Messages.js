import React from 'react'
import { Comment, Segment } from 'semantic-ui-react'
import MessageForm from './MessageForm'
import MessagesHeader from './MessagesHeader'
import firebase from '../../firebase'
import Message from './Message'
import { setUserPosts } from '../../actions'
import { connect } from 'react-redux'
import Typing from './Typing'
import Skeleton from './Skeleton'




class Messages extends React.Component {
    state = {
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef:firebase.database().ref('privateMessages'),
        messagesRef: firebase.database().ref('messages'),
        userRef: firebase.database().ref('users'),
        typingRef: firebase.database().ref('typing'),
        connectedRef: firebase.database().ref('.info/connected'),
        messagesLoading: true,
        messages: [],
        isChannelStarred: false,
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        progressBar: false,
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading: false,
        searchResults: [],
        typingUsers: [],
        listeners: []

    }

    componentDidMount() {
        const { channel, user, listeners } = this.state

        if(channel && user) {
            this.removeListeners(listeners)
            this.addListeners(channel.id)
            this.addUserStarListeners(channel.id, user.uid)
        }
    }

    componentWillUnmount() {
        this.removeListeners(this.state.listeners)
        this.state.connectedRef.off()
    }

    removeListeners = listeners => {
        listeners.forEach(listener => {
            listener.ref.child(listener.id).off(listener.event)

        })
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.messagesEnd) {
            this.scrolllToBottom()
        }
    }

    addToListeners = (id, ref, event) => {
        const index = this.state.listeners.findIndex(listener => {
            return listener.id === id && listener.ref === ref && listener.event === event
        })

        if(index === -1) {
            const newListener = { id, ref, event}
            this.setState({ listeners: this.state.listeners.concat(newListener)})

        }
    }

    scrolllToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: 'smooth'})
    }

    addListeners = channelId  => {
        this.addMessageListener(channelId)
        this.addTypingListener(channelId)
    }

    addTypingListener = channelId => {
        let typingUsers = []
        this.state.typingRef.child(channelId).on('child_added', snap => {
            if(snap.key !== this.state.user.uid) {
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val()
                })
                this.setState({ typingUsers })
            }
        })

        this.addToListeners(channelId, this.state.typingRef, 'child_added')

        this.state.typingRef.child(channelId).on('child_removed', snap => {
            const index = typingUsers.findIndex(user => user.id === snap.key)
            if(index !== -1) {
                typingUsers = typingUsers.filter(user => user.id === snap.key)
                this.setState({ typingUsers })
            }
        })

        this.addToListeners(channelId, this.state.typingRef, 'child_removed')


        this.state.connectedRef.on('value' , snap => {
            if(snap.val() === true) {
                this.state.typingRef.child(channelId).child(this.state.user.uid).onDisconnect().remove(err => {
                    if(err !== null) {
                        console.error(err)
                    }
                })
            }
        })

    }

    addMessageListener = channelId => {
        let loadedMessages = []
        const ref = this.getMessagesRef()
        ref.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val())
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            })

            this.countUniqueUser(loadedMessages)
            this.countUserPosts(loadedMessages)
        })
        this.addToListeners(channelId, ref, 'child_added')

    }

    addUserStarListeners = (channelId, userId) => {
        this.state.userRef.child(userId).child('starred').once('value').then(data => {
            if (data.val() !== null) {
                const channelIds = Object.keys(data.val())
                const prevstarred = channelIds.includes(channelId)
                this.setState({ isChannelStarred: prevstarred })

            }
        })
    }

    getMessagesRef = () => {
        const { messagesRef, privateMessagesRef, privateChannel } = this.state

        return privateChannel ? privateMessagesRef :  messagesRef
    }

    handleStar = () => {
        this.setState(prevState => ({
            isChannelStarred: !prevState.isChannelStarred

        }), () => this.starChannel())
    }

    starChannel = () => {
        if(this.state.isChannelStarred) {
            this.state.userRef.child(`${this.state.user.uid}/starred`).update({
                [this.state.channel.id]: {
                    name: this.state.channel.name,
                    details: this.state.channel.details,
                    createdBy: {
                        name: this.state.channel.createdBy.name,
                        avatar: this.state.channel.createdBy.avatar
                    }
                }
            })
        } else {
            this.state.userRef.child(`${this.state.user.uid}/starred`).child(this.state.channel.id).remove(err => {
                if(err !== null) {
                    console.log(err);
                }
            })
        }

    }

    countUniqueUser = messages => {
        const uniqueUser = messages.reduce((acc, message) => {
            if(!acc.includes(message.user.name)) {
                acc.push(message.user.name)
            }
            return acc
        }, [])

        const plural = uniqueUser.length > 1 || uniqueUser.length === 0

        const numUniqueUsers = `${uniqueUser.length} User${ plural ? 's' : '' }`
        this.setState({numUniqueUsers: numUniqueUsers})
    }


    countUserPosts = messages => {
        let userPosts = messages.reduce((acc, message) => {
            if(message.user.name in acc) {
                acc[message.user.name].count += 1
            } else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                }
            }

            return acc
        }, {})
        this.props.setUserPosts(userPosts)
    }

    handleSearchChange = event => {
        this.setState({
            searchTerm : event.target.value,
            searchLoading: true
        }, () => this.handleSearchMessages())
    }

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages]
        const regex = new RegExp(this.state.searchTerm , 'gi')
        const searchResults = channelMessages.reduce((acc, message) => {
            if(message.content && message.content.match(regex) || message.user.name.match(regex)) {
                acc.push(message)
            }
            return acc

        }, [])

        this.setState({ searchResults: searchResults})
        setTimeout(() => this.setState({ searchLoading: false}), 1000)
    }

    displayMessages = messages => (
        messages.length > 0 && messages.map(message => (
            <Message
                key={message.timestamp}
                message={message}
                user={this.state.user}
                
            />
        ))
    )

    isProgressBarVisible = percent => {
        if(percent > 0) {
            this.setState({ progressBar: true})
        }

    }

    displayChannelName = channel => {
        return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : ''
    }

    displayTypingUser = users => (
        users.length > 0 && users.map(user => (
            <div style={{display: "flex", alignItems: "center", marginBottom: '0.2em'}} key={user.id}>
                <span className="user__typing">{user.name} Is Typing</span><Typing/>
            </div>
        ))
    )

    displayMessageSkeleton = loading => (
        loading ? (
            <React.Fragment>
                {[...Array(10)].map((_,i) =>(
                    <Skeleton key={i}/>
                ))}
            </React.Fragment>
        ) : null
    )

    render() {
        const { messagesRef, channel, user, messagesLoading , typingUsers, messages, progressBar, isChannelStarred, privateChannel, numUniqueUsers, searchResults, searchTerm, searchLoading } = this.state
        return (
            <>
            <MessagesHeader channelName = {this.displayChannelName(channel)} handleStar={this.handleStar} isChannelStarred={isChannelStarred} isPrivateChannel={privateChannel} searchLoading={searchLoading} handleSearchChange={this.handleSearchChange} numUniqueUsers={numUniqueUsers}/>

            <Segment>
                <Comment.Group className={ progressBar ? "messages__progress" : "messages"}>
                    {this.displayMessageSkeleton(messagesLoading)}
                    {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages) }
                    {this.displayTypingUser(typingUsers)}
                    <div ref={node => (this.messagesEnd = node )}></div>
                </Comment.Group>

            </Segment>
            <MessageForm isProgressBarVisible={this.isProgressBarVisible} getMessagesRef={this.getMessagesRef} isPrivateChannel={privateChannel} messagesRef={messagesRef} currentChannel={channel} currentUser={user}/>
            </>
        )
    }
}

export default connect(null, { setUserPosts })(Messages) 