import React, {useEffect, useState, useRef } from 'react';
import GlobalVariables from './js/globalvariables.js';
import { OAuth } from 'oauthio-web'
import { Octokit} from "https://esm.sh/octokit@2.0.19"

/*--Credit to https://codepen.io/colorlib/pen/rxddKy */
//var PopUpState = true;

//Login pop up component logic: pop up appears introducing logo and github login button, 
// if user gets authenticated in the tryLogin function, then the pop up disappears and the projects appear, if they do notget authenticated, then the pop up stays and the user can browse projects

var octokit = null
var currentUser = null



// initial pop up construction with github login button
const InitialLog= ({tryLogin}) =>{
     /** 
     * Try to login using the oauth popup.
     */
    return (
        <div className='login-popup'id="projects-popup">
        <div className="login-page">
        <div className="form animate fadeInUp one">
        <div id="gitSide" className="logindiv">
                <img className="logo" src='/imgs/maslow-logo.png' alt="logo"/>
                <div id="welcome"><img src='/imgs/maslowcreate.svg' alt="logo" style={{width: "300px",padding: "10px", margin: "0"}}/></div>
                <p style= {{padding: "0 20px"}}>Maslow Create projects are stored through GitHub. You control your files. </p>
                <form className="login-form">
                  <button type="button" id = "loginButton" onClick={tryLogin} style ={{height: "40px"}}>Login With GitHub</button>
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

/* to add: if current user is null show this next part */
const ShowProjects=(props) =>{
    const [nodes, setNodes] = useState([]);
    const [projectsLoaded, setStateLoaded] = React.useState(false);
    //if there's a user make initial project query 
    useEffect(() => {
    octokit.request('GET /search/repositories', { 
        q: ' ' + 'fork:true user:' + currentUser + ' topic:maslowcreate',
        per_page: 50,
        headers: {
            accept: 'application/vnd.github.mercy-preview+json'
        }
    }).then(result => {
        var userRepos =[]
        result.data.items.forEach(repo => {
            //this.addProject(repo.name, repo.id, repo.owner.login, repo.created_at, repo.updated_at, owned, thumbnailPath)
                userRepos.push(repo)
        })
        setNodes([
            ...userRepos
          ]);
        setStateLoaded(true);
    }) 
},[currentUser])

    const AddProject = () => {
        //const thumbnailPath = "https://raw.githubusercontent.com/"+node.full_name+"/master/project.svg?sanitize=true"       
        return nodes.map(node => (       
            <div className="project" id={node.name}>
                <li>{node.name}</li>
                <img src="/defaultThumbnail.svg"></img></div>       
          ))
    }

    const openInNewTab = (url) => {
        window.open(url, "_blank", "noreferrer");
      };
    return(
    <>
    <div className='login-popup'id="projects-popup" style={{padding: "0",textAlign: "center", backgroundColor: "#f9f6f6", border:"10px solid #3e3d3d"}}>
    <div className='middleBrowse' style={{marginTop:"25px"}}>   
    <div id="welcome" style={{display:"flex",margin:"10px",alignItems:"center"}}> 
        <img src='/imgs/maslow-logo.png' alt="logo" style={{width:"25px", height: "25px",borderRadius: "50%"}}/>
        <img src='/imgs/maslowcreate.svg' alt="logo" style={{height: "20px",padding: "10px"}}/>
        <button className="form browseButton githubSign" id="loginButton2" style={{width: "90px", fontSize:".7rem", marginLeft: "auto"}}>Login</button>
        <button className="form browseButton githubSign" onClick={()=>openInNewTab('https://github.com/join')} style={{width: "130px", fontSize: ".7rem", marginLeft: "5px"}}>Create an Account</button>
        </div> 
        <img src='/imgs/search_icon.svg' alt="search" style={{width:"20px", float: "right",color: "white",position:"relative", right:"3px", opacity:"0.5"}}/>
    </div>
    <div id="welcome" style={{justifyContent: "flex-start", display: "inline", width: "100%", fontSize: "18px"}}>Maslow Create User Projects</div>
    <div id="tabButtons" className="tab"></div>
    <input type="text" contentEditable="true" placeholder="Search for project.." className="menu_search" id="project_search"/>
    <div className="browseDisplay">
     <img src="/imgs/list-with-dots.svg" style={{height:"75%",padding: "3px"}}/>
    </div>
    <div className="browseDisplay active_filter" id="thumb">
      <img src="/imgs/thumb_icon.png" style={{height: "80%",padding: "3px"}}/>
    </div>
    <div><ul> {projectsLoaded ?  <ul>
        <AddProject/>
      </ul>: "no"}</ul></div>
    </div>
    </>
    )
}

function LoginPopUp() {

    const tryLogin = function(props){
    
    
        // Initialize with OAuth.io app public key
        if(window.location.href.includes('private')){
            OAuth.initialize('6CQQE8MMCBFjdWEjevnTBMCQpsw') //app public key for repo scope
        }
        else{
            OAuth.initialize('BYP9iFpD7aTV9SDhnalvhZ4fwD8') //app public key for public_repo scope
        }
        
        // Use popup for oauth
        OAuth.popup('github').then(github => {
            /** 
             * Oktokit object to access github
             * @type {object}
             */
           
            octokit = new Octokit({
                auth: github.access_token
            })
            //getting current user post authetication
            octokit.request('GET /user', {
              }).then(response => {
                currentUser = response.data.login;
                if (currentUser){
                    setIsLoggedIn(true);
                }
              })      
        })
    }   

  const [isloggedIn, setIsLoggedIn] = React.useState(false);
  let popUpContent;
  if (isloggedIn) {
    popUpContent = <ShowProjects user={currentUser}/>;
  } else {
    popUpContent = <InitialLog tryLogin={tryLogin}/>;
  }
  return <div>{popUpContent}</div>;
  }

  export default LoginPopUp;
