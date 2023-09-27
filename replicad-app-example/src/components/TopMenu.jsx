
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
    /*{checks for top level variable and show go-up button if this is not top molecule  ::::
      i think this is the way of checking for molecule.toplevel but i'm wondering if there's a more efficient way that doesn't use Useeffect()
      }*/
    const TopLevel= () =>{
      const [currentMoleculeTop, setTop] = useState(false);
      const ref = useRef();
      useEffect(() => {
          if (GlobalVariables.currentMolecule.topLevel !== undefined
          && GlobalVariables.currentMolecule.topLevel) {
            setTop(false);
          }
      }, [currentMoleculeTop]);
      return (
        <>
        {currentMoleculeTop && <img className="nav-img nav-bar thumnail-logo" src={'/imgs/Go Up.svg'} key="" title="" /> }
        </>
        )
      }

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
     <TopLevel/> 
     <Navbar />
</>
 )

  }

  export default TopMenu;