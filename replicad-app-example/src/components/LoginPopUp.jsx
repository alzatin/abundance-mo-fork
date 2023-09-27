import React, {useEffect, useState, useRef } from 'react';
import GlobalVariables from './js/globalvariables.js';


/*--Credit to https://codepen.io/colorlib/pen/rxddKy */
//var PopUpState = true;
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
                  <button type="button" id = "loginButton" onClick={GlobalVariables.gitHub.tryLogin} style ={{height: "40px"}}>Login With GitHub</button>
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
const NoUserLog=() =>{
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
    <input type="text" contentEditable="true" placeholder="Search for project.." class="menu_search" id="project_search"/>
    <div className="browseDisplay">
     <img src="/imgs/list-with-dots.svg" style={{height:"75%",padding: "3px"}}/>
    </div>
    <div className="browseDisplay active_filter" id="thumb">
      <img src="/imgs/thumb_icon.png" style={{height: "80%",padding: "3px"}}/>
    </div>
    </div>
    </>
    )
}
//make a state (if authenticated, show projects, if not, show login)
//const LoginFill = <>{PopUpState ? <InitialLog/>: <WelcomeLog/>}</>

function LoginPopUp() {
   
    return (
    <>  
    <InitialLog/>
    </>)
  }

  export default LoginPopUp;

  /*
/** 
 * 
 * 
 * 
 * 
     * Display projects which can be loaded in the popup.
     
    this.showProjectsToLoad = function(){
    
    var middleBrowseDiv = document.createElement("div")
    if (currentUser == null){
        githubSign.addEventListener("mousedown", () => {
            this.tryLogin()
        })
    }

    popup.classList.remove('off')

    //Input to search for projects

    searchBar.addEventListener('keydown', (e) => {
        
        this.loadProjectsBySearch("yoursButton",e, searchBar.value, "updated")
        this.loadProjectsBySearch("githubButton",e, searchBar.value, "stars") // updated just sorts content by most recently updated
    })
    

    this.projectsSpaceDiv = document.createElement("DIV")
    this.projectsSpaceDiv.setAttribute("class", "float-left-div")
    this.projectsSpaceDiv.setAttribute("style", "overflow-x: hidden; margin-top: 10px;")
    popup.appendChild(this.projectsSpaceDiv)
    
    const pageChange = document.createElement("div")
    const pageBack = document.createElement("button")
    pageBack.setAttribute("id", "back")
    pageBack.setAttribute("class", "page_change")
    pageBack.innerHTML = "&#8249;"

    const pageForward = document.createElement("button")
    pageChange.appendChild(pageBack)
    pageChange.appendChild(pageForward)
    pageForward.setAttribute("id", "forward")
    pageForward.setAttribute("class", "page_change")
    pageForward.innerHTML = "&#8250;"

    popup.appendChild(pageChange)

    
    this.openTab(page)

    //Event listeners 

    browseDisplay1.addEventListener("click", () => {
        // titlesDiv.style.display = "flex"
        browseDisplay2.classList.remove("active_filter")
        this.openTab(page)
    })
    browseDisplay2.addEventListener("click", () => {
        // titlesDiv.style.display = "none"
        browseDisplay2.classList.add("active_filter")
        this.openTab(page)
    })
    pageForward.addEventListener("click", () => {
        if (page >=1){ page +=1 }
        this.openTab(page)
    })
    pageBack.addEventListener("click", () => {
        if (page >1){page -=1}
        this.openTab(page)
    })

}
  */
