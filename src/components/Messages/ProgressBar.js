import React from 'react'
import { Progress } from 'semantic-ui-react'

class ProgressBar extends React.Component {
    render() {

        const { uploadState, percentUploaded } = this.props
        return (
            uploadState === "uploading" && (
                <Progress
                    className="progress__bar"
                    percent={percentUploaded}
                    progress
                    indicating
                    size="medium"
                    inverted
                
                
                />
            )
        )
    }
}

export default ProgressBar 