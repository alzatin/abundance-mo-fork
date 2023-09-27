
import React, {useEffect, useState, useRef } from 'react';
import GlobalVariables from './js/globalvariables.js';

function TopMenu() {
    const navItems = [
      'Open',
      'GitHub',
      'Read Me',
      'Bill of Materials',
      'Share',
      'Save Project',
      'Pull Request',
      'Delete Project'
    ];
    /*{TO DO ::::make it if molecule is top then render goUpalEVELBUTTON otherwise dont}*/
   
    const topLevel= <img className="nav-img nav-bar thumnail-logo" src={'/imgs/Go Up.svg'} key="" title="" />
    
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
          <button className="toggle menu-nav-button" onClick={() => setNavbarOpen((prev) => !prev)} >
          {navbarOpen ? <img className= "thumnail-logo nav-img" src={'/imgs/three-menu.svg'} /> : <img className= "thumnail-logo nav-img rotati" src={'/imgs/three-menu.svg'} />}
           </button>

          <ul className={`menu-nav${navbarOpen ? ' show-menu' : ''}`}> 
          {navItems.map((item, index) =>(
            <button className='menu-nav-button'>
            <img className=" thumnail-logo" alt={item} src={'/imgs/'+item+'.svg'} key={item} title={item +"-button"} onClick={() => console.log({item})}/>
            </button>
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