import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Form, Grid, Header, Icon, Message, Segment } from 'semantic-ui-react'
import firebase from '../../firebase'
import md5 from 'md5'

class Register extends React.Component {
    state = {
        username: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        errors: [],
        loading: false,
        usersRef: firebase.database().ref('users')
    }
    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value })
    }

    isFormValid = () => {
        let errors = []
        let error
        if (this.isFormEmpty(this.state)) {
            error = {message: "Please Fill All The Fields."}
            this.setState({errors: errors.concat(error)})
            return false

            
        } else if (!this.isPasswordValid(this.state)) {
            error = {message: "Password is Invalid."}
            this.setState({errors: errors.concat(error)})
            return false

        } else {
            return true
        }
    }

    isPasswordValid = ({ password, passwordConfirmation}) => {
        if(password.length < 6 || passwordConfirmation.length < 6) {
            return false
        } else if(password !== passwordConfirmation) {
            return false
        } else {
            return true
        }
    }

    isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
        return !username.length || !email.length || !password.length || !passwordConfirmation.length
    }

    displayError = error => error.map((error,i) => <p key={i}>{error.message}</p>)

    handleInputError = (errors, inputName) => errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'error' : ''

    handleSubmit = (event) => {

        event.preventDefault()

        if (this.isFormValid()) {

            this.setState({errors: [], loading:true})

            firebase
                .auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then(createdUser => {
                    console.log(createdUser)
                    createdUser.user.updateProfile({
                        displayName: this.state.username,
                        photoURL: `https://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
                    })
                    .then(()=> {
                        this.saveUser(createdUser).then(() => {
                            console.log('User Saved')
                            this.setState({loading:false})
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        this.setState({ errors: this.state.errors.concat(err),  loading:false})
    
                    })
                })
                .catch(err => {
                    console.log(err)
                    this.setState({ errors: this.state.errors.concat(err),  loading:false})

                })
        }

        

    }

    saveUser = (createdUser) => {
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL
        })

    }
    render() {
        const { username, email, password, passwordConfirmation, errors, loading } = this.state
        return (
           <Grid textAlign='center' verticalAlign='middle' className='app'>
               <Grid.Column style={{maxWidth: 450}}>
                   <Header as='h1' icon color='teal' textAlign='center'>
                       <Icon name='puzzle piece' color='teal'/>
                       Register for Alap
                   </Header>
                   <Form onSubmit={this.handleSubmit} size='large'>
                       <Segment stacked>
                           <Form.Input fluid name='username' icon='user' iconPosition='left' placeholder='Username' value={username} onChange={this.handleChange} type='text'/>
                           <Form.Input fluid name='email'  icon='mail' iconPosition='left' placeholder='Email Address' value={email} className={this.handleInputError(errors, 'email')} onChange={this.handleChange} type='email'/>
                           <Form.Input fluid name='password' icon='lock' iconPosition='left' placeholder='Password' value={password} className={this.handleInputError(errors, 'password')} onChange={this.handleChange} type='password'/>
                           <Form.Input fluid name='passwordConfirmation' icon='repeat' iconPosition='left' placeholder='Password Confirmation' className={this.handleInputError(errors, 'password')} value={passwordConfirmation} onChange={this.handleChange} type='password'/>
                           <Button disabled={loading} className={loading ? 'loading' : ''} color='teal' fluid size='large'>Submit</Button>
                       </Segment>

                   </Form>
                   {errors.length > 0 && (
                       <Message error>
                           <h3>Error</h3>
                           {this.displayError(errors)}
                       </Message>
                   )}
                   <Message>Already a user? <Link to='/login'>Log in</Link></Message>

               </Grid.Column>

           </Grid>
        )

    }
    
}

export default Register

