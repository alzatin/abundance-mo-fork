import React, {useEffect, useState, useRef } from 'react';
import GlobalVariables from './js/globalvariables.js';


/*--Credit to https://codepen.io/colorlib/pen/rxddKy */

const InitialLog= () =>{
    return (
        <div className='login-popup'id="projects-popup">
        <div className="login-page">
        <div className="form animate fadeInUp one">
        <div id="gitSide" className="logindiv">
                <img className="logo" src='/imgs/maslow-logo.png' alt="logo"/>
                <div id="welcome"><img src='/imgs/maslowcreate.svg' alt="logo" style={{width: "300px",padding: "10px", margin: "0"}}/></div>
                <p style= {{padding: "0 20px"}}>Maslow Create projects are stored through GitHub. You control your files. </p>
                <form className="login-form">
                  <button type="button" id = "loginButton" style ={{height: "40px"}}>Login With GitHub</button>
                  <p className="message">Don't have an account? <a href="https://github.com/join">Create a free account</a></p>
                </form>
        </div>     
        <div id="nonGitSide" className="logindiv curiousBrowse">   
                     <p style={{justifyContent:"flex-start", display: "inline", width: "80%"}}>Check out what others have designed in Maslow Create</p>  
                 <form className="login-form">       
                     <button type="button" className= "browseButton" id = "browseNonGit" style ={{padding: "0 30px"}}>Browse all projects</button> 
                 </form> 
                 </div>    
        </div>
        </div>
    </div>
    )
}

function LoginPopUp() {
    
    return (<InitialLog/>)
  }

  export default LoginPopUp;

