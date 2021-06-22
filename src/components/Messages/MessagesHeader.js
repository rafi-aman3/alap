import React from 'react'
import { Header, Icon, Input, Segment } from 'semantic-ui-react'

class MessagesHeader extends React.Component {
    render() {
        const { channelName, isPrivateChannel, numUniqueUsers, handleStar, isChannelStarred, handleSearchChange, searchLoading } = this.props
        return (
            <Segment clearing>
                <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0}}>
                    <span>
                        {channelName}
                        {!isPrivateChannel && (<Icon onClick={handleStar} name={isChannelStarred ? 'star' : 'star outline'} color={isChannelStarred ? 'red': 'blue'}/>)}
                    </span>
                    <Header.Subheader>{numUniqueUsers}</Header.Subheader>
                </Header>
                <Header floated="right">
                    <Input loading={searchLoading} size="mini" onChange={handleSearchChange} icon="search" name="searchTerm" placeholder="Search Messages"/>

                </Header>

            </Segment>
        )
    }
}

export default MessagesHeader 