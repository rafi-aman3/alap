import React from 'react'
import { Accordion, Header, Icon, Image, List, Segment } from 'semantic-ui-react'

class MetaPanel extends React.Component {
    state ={
        channel: this.props.currentChannel,
        activeIndex: 0,
        privateChannel: this.props.isPrivateChannel
    }

    setActiveIndex = (event, titleProps) => {
        const { index } = titleProps
        const { activeIndex } = this.state
        const newIndex = activeIndex === index ? -1 : index
        this.setState({ activeIndex: newIndex })
    }


    formatCount = count => (count > 1 || count === 0) ? `${count} posts` : `${count} post`

    displayPosters = posts => (
        Object.entries(posts).sort((a,b) => b[1] - a[1]).map(([key, val], i) => (
            <List.Item key={i}>
                <Image circular src={val.avatar}/>
                <List.Content>
                    <List.Header as='a'>{key}</List.Header>
                    <List.Description>{this.formatCount(val.count)}</List.Description>
                </List.Content>

            </List.Item>

        ))
    ).slice(0,5)


    render() {

        const { activeIndex, privateChannel, channel } = this.state
        const { userPosts } = this.props

        if(privateChannel )  return null
        return (
            <Segment loading={!channel}>
                <Header as="h3" attached="top">
                    About #{ channel && channel.name}
                </Header>
                <Accordion styled attached="true" >
                    <Accordion.Title active={activeIndex === 0 } index={0} onClick={this.setActiveIndex}>
                        <Icon name='dropdown'/>
                        <Icon name='info'/>
                        Channel Detail 
                       
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 0}>
                        {channel && channel.details}
                    </Accordion.Content>
                    <Accordion.Title active={activeIndex === 1 } index={1} onClick={this.setActiveIndex}>
                        <Icon name='user circle'/>
                        <Icon name='info'/>
                        Top Posters
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 1}>
                        <List>
                        {userPosts && this.displayPosters(userPosts)}
                        </List>
                    
                    </Accordion.Content>
                    <Accordion.Title active={activeIndex === 2 } index={2} onClick={this.setActiveIndex}>
                        <Icon name='dropdown'/>
                        <Icon name='pencil alternate'/>
                        Created by
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 2}>
                        <Header as="h3">
                            <Image circular src={ channel && channel.createdBy.avatar}/>
                            { channel && channel.createdBy.name}
                        </Header>
                        
                    </Accordion.Content>
                </Accordion>
            </Segment>
        )
    }
}

export default MetaPanel 