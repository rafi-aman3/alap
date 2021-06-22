import React from 'react'
import { Dimmer, Loader } from 'semantic-ui-react'

const Spinner = () =>  (
        <Dimmer>
            <Loader size="huge" content={"Preparing to Chat.."}/>
        </Dimmer>
    )

export default Spinner