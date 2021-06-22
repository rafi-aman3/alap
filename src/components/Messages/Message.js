import moment from 'moment'
import React from 'react'
import { Comment, Image } from 'semantic-ui-react'

class Message extends React.Component {

    isOwnMessage = (message, user) => {
        return message.user.id === user.uid ? 'message__self' : ''
    }

    isImage = (message) => {
        return message.hasOwnProperty('image') && !message.hasOwnProperty('content')

    }

    timeFromNow = messageTimeStamp => moment(messageTimeStamp).fromNow()

    
    render() {
        const { message, user} = this.props
        return (
            <Comment>
                <Comment.Avatar src={message.user.avatar}/>
                <Comment.Content className={this.isOwnMessage(message, user)}>
                    <Comment.Author as="a">{message.user.name}</Comment.Author>
                    <Comment.Metadata>{this.timeFromNow(message.timestamp)}</Comment.Metadata>
                   
                    {this.isImage(message) ? 
                        <Image src={message.image} className="message__image"/> : 
                        <Comment.Text>{message.content}</Comment.Text>
                        }

                </Comment.Content>

            </Comment>
        )
    }
}

export default Message 