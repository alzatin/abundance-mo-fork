
import React, {useEffect, useState, useRef } from 'react';
import GlobalVariables from './js/globalvariables.js';

function TopMenu() {
    const navItems = [
      'Load',
      'Delete Project',
      'GitHub',
      'Read Me',
      'Bill of Materials',
      'Share',
      'Save'
    ];
    /*{TO DO ::::make it if molecule is top then render goUpalEVELBUTTON otherwise dont}*/
   
    const topLevel= <img className="thumnail-logo top-buttons" src={'/imgs/goup_img.png'} key="" title="" />
    
    /*{nav bar toggle component}*/
    const Navbar = () => {
      const [navbarOpen, setNavbarOpen] = useState(false);
      return (
        <>
          <button className="toggle top-buttons" onClick={() => setNavbarOpen((prev) => !prev)} >
          
          {navbarOpen ? <img className="top-buttons thumnail-logo" src={'/imgs/three-menu.png'} /> : <img className="top-buttons thumnail-logo" src={'/imgs/Save.png'} />}
           </button>

          <ul className={`menu-nav${navbarOpen ? ' show-menu' : ''}`}> 
          {navItems.map((item, index) =>(
            <img className=" thumnail-logo" src={'/imgs/'+item+'.png'} key={item} title={item +"-button"} onClick={() => console.log({item})}/>
        )) } 
    </ul>
        </>
      );
    };

    return (
      <>
     <>{topLevel}</> 
     <Navbar />
      
    
    {/*<div id="top_button_wrap">
    <button className="top_buttons outerbutton" style= "right:40px;" type="button" id = "goup_top" title="Go up a level"> <img className="thumnail-logo" src='/imgs/goup_img.png' alt="Go-up" style="  transform: scale(.67); border-radius: 0px;"/> </button> 
    <button className="top_buttons" type="button" id = "straight_menu" title="" style="background-color: #ededed; border: 2px solid black;"> 
        <img className="three-menu" src='/imgs/three-menu.png' alt="three" /></button>
    <div id ="toggle_wrap">
        
        <button className="top_buttons" type="button" id = "localMolecules_top" title="Available Molecules">  </button> 
        <button className="top_buttons option" type="button" id = "delete_top" title="Delete Project"> <img className="thumnail-logo" src='/imgs/delete-logo.svg' alt="Delete Project" style=" transform: scale(.87); border-radius: 0px;"/> </button>
         <button className="top_buttons option" type="button" id = "github_top" title="GitHub"> <img className="thumnail-logo" src='/imgs/github-logo.png' alt="Git" style=" transform: scale(1.2);" /> </button>
         <button className="top_buttons option" type="button" id = "read_top" title="Read Me"> <img className="thumnail-logo" src='/imgs/read_img.png' alt="Read-me" style=" transform: scale(.67); border-radius: 0px;"/> </button> 
         <button className="top_buttons option" type="button" id = "bom_top" title="Bill of Materials" > <img className="thumnail-logo" src='/imgs/bom-logo.png' alt="BOM"/> </button>
         <button className="top_buttons option" type="button" id = "share_top" title="Share" > <img className="thumnail-logo" src='/imgs/share-img.png' alt="Share"/> </button>
         <button className="top_buttons option" type="button" id = "save_top" title="Save"> <img className="thumnail-logo" src='/imgs/save-image.png' alt="Save" style=" transform: scale(.67); border-radius: 0px;"/> </button>  
        <button className="top_buttons option" type="button" id = "projectmenu_top" title="Open projects"> <img className="thumnail-logo" src='/imgs/open-logo.png' alt="Load" style=" transform: scale(.67); border-radius: 0px;"/> </button>
        <button className="top_buttons option" type="button" id = "pull_top" title="Make Pull Request"> <img className="thumnail-logo" src='/imgs/pullrequest-logo.png' alt="Make Pull Request" style=" transform: scale(.67); border-radius: 0px;"/> </button>
    </div>
</div>  */}
</>
 )

  }

  export default TopMenu;