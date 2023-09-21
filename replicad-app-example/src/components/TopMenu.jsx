
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
      'Save',
      'Pull Request',
      'Open',
    ];
    /*{TO DO ::::make it if molecule is top then render goUpalEVELBUTTON otherwise dont}*/
   
    const topLevel= <img className="thumnail-logo nav-img" src={'/imgs/goup_img.png'} key="" title="" />
    
    /*{nav bar toggle component}*/
    const Navbar = () => {
      const [navbarOpen, setNavbarOpen] = useState(false);
      const ref = useRef();
      useEffect(() => {
        const handler = (event) => {
          if (
            navbarOpen &&
            ref.current &&
            !ref.current.contains(event.target)
          ) {
            setNavbarOpen(false);
          }
        };
        document.addEventListener('mousedown', handler);
        return () => {
          // Cleanup the event listener
          document.removeEventListener('mousedown', handler);
        };
      }, [navbarOpen]);
      return (
        <>
        <nav ref={ref} className="navbar">
          <button className="toggle nav-img" onClick={() => setNavbarOpen((prev) => !prev)} >
          {navbarOpen ? <img className= "thumnail-logo" src={'/imgs/three-menu.png'} /> : <img className= "thumnail-logo" src={'/imgs/Save.png'} />}
           </button>

          <ul className={`menu-nav${navbarOpen ? ' show-menu' : ''}`}> 
          {navItems.map((item, index) =>(
            <img className=" thumnail-logo" src={'/imgs/'+item+'.svg'} key={item} title={item +"-button"} onClick={() => console.log({item})}/>
        )) } 
    </ul>
    </nav>
        </>
      );
    };

    return (
      <>
     <>{topLevel}</> 
     <Navbar />
</>
 )

  }

  export default TopMenu;