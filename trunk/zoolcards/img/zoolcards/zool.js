/********************************************************************************************************************************************\
|* Zool cards by Konijn                                                                                                                     *|
|* Copyright (C) 2008 Konijn                                                                                                                *|
|*                                                                                                                                          *|
|* This program is free software; you can redistribute it and/or modify it under the terms of the GNU GPL Version 2 as published by the FSF *|
|* See copying.txt                                                                                                                          *|
|* Dedicated to Segolene de Basquiat                                                                                                        *|
\********************************************************************************************************************************************/


/* 
 * Global Variables
 */  

  var dragObject     = null;
  var dragOffset     = null;

  var sizeObject     = null;
  var sizeOffset     = null;

  var viewObject     = null; //Evil drag and size being 4 letters, what else could I do ;)
  var propObject     = null;


  function helloWorld() {
    window.alert("Hello World");
  }

  function setStatus( s ){
    document.getElementById("status").setAttribute("label", s );
  } 

  //This determines a mouse cursor, based on the size of the object 
  //and the location of the mouse
  function determineMouseCursor( e ){
    //Mostly shortcuts
    var o         = e.target;
    var box       = o.boxObject;
    var direction = "";
    //This might not work with scrolling
    var offsetX = (e.clientX - box.x);
    var offsetY = (e.clientY - box.y);
    //Only show South and West, because that is the only parts that are grippable for resize
    if( offsetY > e.target.boxObject.height - 3 - 3) direction = direction + "s";
    if( offsetX > e.target.boxObject.width - 3 - 3 ) direction = direction + "e";
    //Mouse cursor either move or size
    o.style['cursor'] = ( direction.length > 0 ) && !e.target.dontResize ? direction + "-resize" : "move";
    return false;
  }

  function appendGenericElement( container , element ){
    var o = document.createElement( element );
    o.id   = element;  // This is somewhat evil I guess
    o.name = element;
    container.appendChild( o );
    return o;
  }

  //This could have been a macro ...
  function appendElement( container , element , id){
    var o = appendGenericElement( container , element )
    o.id   = id;
    o.name = id;
    return o;
  }


  //All elements are added to the window, which is always called zool
  //standard settings are applied in the second block, can be overrided by caller
  //standard listeners are added for showing drag and resize 
  //standard listeners can be removed by calling removeChildListeners
  //Returns the created object for further manipulation
  function addZoolChild( element , id ){

    var autolabel = document.getElementById("auto_label");
    var label = "";
    var o;
    var caption;
    if( autolabel.hasAttribute("checked") && element != "label" ){
      caption = prompt("Label value" , id );
      if( caption != null && caption != ""  ){
        label = addZoolChild( "label" , "label" );
        label.setAttribute("value" , caption );
        id = caption;
      } //The user gave use a valid label
    }//We want to create an extra label
    o = appendElement( document.getElementById("zool") , element , id );

    o.height = 25;
    o.width  = 50;
    if( label ){
      o.left = label.width*1;
      o.top  = ( o.height - label.height ) / 2;
      o.label = label; 
    }else{
      o.left = 0;
      o.top = 0;
    }
    addChildListeners( o );
    return o;
}

  //Allow for the resize/move cursor, properties display, dragging and resizingg
  function addChildListeners( o){
    o.addEventListener( "mousemove"    , determineMouseCursor , false );
    o.addEventListener( "click"        , genericMouseClick    , false );
    o.addEventListener( "mousedown"    , startDrag            , false );
    o.addEventListener( "mousedown"    , startResize          , false );
  }

  //Allow for removing all standard listeners, some objects are special ( like properties )
  function removeChildListeners( o ){
    o.removeEventListener( "mousemove" , determineMouseCursor , false );
    o.removeEventListener( "click"     , genericMouseClick    , false );
    o.removeEventListener( "mousedown" , startDrag            , false );
    o.removeEventListener( "mousedown" , startResize          , false );
  }

/*
 * Generic Events
 */

  function gridDetermineMouseCursor(e){
    //This might not work with scrolling
    var offsetX = (e.clientX - e.target.boxObject.x);
    var offsetY = (e.clientY - e.target.boxObject.y);

    e.target.style.cursor = "";

    if( offsetY > e.target.boxObject.height - 12 - 3){
      if( offsetX > e.target.boxObject.width - 12 - 3 ){
        e.target.style.cursor = "se-resize";
      }
    }
    return true;
  }

  function setUpGroupBox( e ){
    //Logically, c stands for container, which the groupbox is
    var c = document.getElementById("zool-panel");    //This will allow to check for an existing groupbox
    var o;                                            //Generic object
    var style;                                        //Generic style holder
    //If the panel wasnt created yet, create it now
    if(!c){
      c = appendElement( document.getElementById("zool") , "groupbox" , "zool-panel" );
    }
    //Take care of all events
    c.addEventListener( "mousemove" , gridDetermineMouseCursor , true );
    c.addEventListener( "mousedown" , startResize, false );
    c.width = 300;
    c.height = 300;
    c.top = 0;
    c.left = 0;
    //Remove all existing children, we might be looking at a different element
    while (c.firstChild) {
      c.removeChild(c.firstChild);
    }
    //Set Caption
    o = document.createElement( "caption" );
    o.setAttribute("label", "Properties");
    o.setAttribute("id" , "zool-panel-caption");
    //addChildListeners( o );
    o.addEventListener( "mousemove"    , determineMouseCursor , false );
    //o.style.cursor = "move";
    o.style['cursor'] = "move";
    o.addEventListener( "mousedown"    , startDrag            , false );
    o.dontResize = true;
    c.appendChild(o);

    //Start adding a tree, which does the resizing without impacting the label/caption of the groupbox
    //Makes sure there are nice column headers, and a splitter between columns
    //Make sure that string things are editable
    //Note : editable tree is only doable in FF3
    

    var tree = appendGenericElement( c , "tree" );

    tree.setAttribute( "editable", "true");
    tree.setAttribute( "flex", "1");
    tree.style.fontSize = "10px";
    tree.style.fontFamily = "Arial";
    tree.addEventListener( "click" , treeMouseClick , false );

    //Tree Columns, really 2 columns + splitter
    var treecols = appendGenericElement( tree , "treecols" );

    //The columns themselves : column + splitter + column

    var treecol1 = appendElement( treecols , "treecol" , "treecol1" );
    treecol1.setAttribute( "label" , "Property" );
    treecol1.dontResize = true;

    var treesplitter = appendGenericElement( treecols , "splitter" );
    treesplitter.setAttribute("class","tree-splitter");
    treesplitter.dontResize = true;

    var treecol2 = appendElement( treecols , "treecol" , "treecol2" );
    treecol2.setAttribute( "label" , "Value" );
    treecol2.setAttribute( "flex" , "2" );
    treecol2.dontResize = true;

    var treeChildren = appendGenericElement( tree , "treechildren" );

    //This is as good a moment to determine the viewObject
    viewObject = e.target;

    for( var a in e.target ){
      try
      {
        if( typeof a != "function" && (typeof e.target[a]) != "function" ){
          if( typeof e.target[a] == "string" || typeof e.target[a] == "number" ){
            addPropertyValue2Tree( treeChildren , a  , e.target[a] );
          }else if( typeof e.target[a] == "object" ){
            addPropertyValue2Tree( treeChildren , a  , e.target[a]==null?"[null]...":e.target[a]+"..." );
          }else{
            var o = addPropertyValue2Tree( treeChildren , a  , typeof e.target[a] + ":" + e.target[a]  );
            //Dont you just love annotating objects ;]
            o.doSomething = true;
            o.field       = e.target[a];
          }
        }
      }
      catch (er) { type = 2; }
    }


  }

  /*
     Tree items need to be added like this :
     <treeitem>
       <treerow>
         <treecell label="joe@somewhere.com" editable="false"/>
         <treecell label="Top secret plans" />
       </treerow>
     </treeitem>
     We return the last element in case the caller wants to do extra stuff
  */
  function addPropertyValue2Tree( treeChildren , property , value  ){
    var treeitem = appendGenericElement( treeChildren , "treeitem" );
    var treerow  = appendGenericElement( treeitem     , "treerow"  );

    var cell1    = appendGenericElement( treerow      , "treecell" );
    cell1.setAttribute( "label"    , property );
    cell1.setAttribute( "editable" , "false" );

    var cell2    = appendElement( treerow , "treecell" , "_" + property );
    cell2.setAttribute( "label"    , value + "" );
    return cell2;
  }


  function genericMouseClick( e ){
    if( e.detail == 2 ){
      setUpGroupBox( e );
	}
  }

  function treeMouseClick( e ){
    if( e.detail == 2 ){
      var box = e.target.parentNode.treeBoxObject;
      var row = { }, col = { }, child = { };
      box.getCellAt(e.clientX, e.clientY, row, col, child);


  // get the row, col and child element at the point

  var cellText = e.target.parentNode.view.getCellText(row.value, col.value);
  alert(cellText);

  //var cellText = e.target.parentNode.view.getCellText(row.value, col.value);

   //We get the treechildren event..., which has treeitems, which has 1 rowitem, 
   //which has 2 cellitems of which second one has the value
   alert(  e.target.childNodes[ row.value ].childNodes[0].childNodes[1].id  );

    }
  }


/* 
 * Global Events
 */
function globalMouseMove(e){
  var mousePos = determineMouseCoordinates(e);
   setStatus( "x: " + mousePos.x + " y: " + mousePos.y + " : " + e.target.id );
  if(dragObject){
    dragObject.top      = mousePos.y - dragOffset.y;
    dragObject.left     = mousePos.x - dragOffset.x;
    if( dragObject.label ){
      dragObject.label.top     = mousePos.y - dragOffset.y - dragOffset.labelydelta;
      dragObject.label.left    = mousePos.x - dragOffset.x - dragOffset.labelxdelta;
    }
    setStatus("dragging " + dragObject.id + " to " + dragObject.top + "," + dragObject.left );
    return true;
  }
  if(sizeObject){
    sizeObject.height = sizeOffset.height*1 +  mousePos.y*1 - sizeOffset.y*1;
    sizeObject.width  = sizeOffset.width*1  +  mousePos.x*1 - sizeOffset.x*1;
    if( sizeObject.resizeSource ){
      if(sizeObject.resizeSource.resizeWidth)  sizeObject.resizeSource.width  = sizeObject.width;
      if(sizeObject.resizeSource.resizeHeight) sizeObject.resizeSource.height = sizeObject.height;
    }
    setStatus("resizing " + sizeObject.id + " to " + sizeObject.width + "," + sizeObject.height );
    return true;
  }
}

function globalMouseUp(e){
  dragObject = null;
  sizeObject = null;
  return true;
}

function determineMouseCoordinates(e){
  if(e.pageX || e.pageY){
    return {x:e.pageX, y:e.pageY};
  }
  return {
    x:e.clientX + document.body.scrollLeft - document.body.clientLeft,
    y:e.clientY + document.body.scrollTop  - document.body.clientTop
  };
}

function getDragOffset( target , e ){
  var mouseCoordinates  = determineMouseCoordinates( e );
  return {x:mouseCoordinates.x - target.left, y:mouseCoordinates.y - target.top};
}

  function startDrag( e ){
    if( e.target.style['cursor'] != "move" ) return;
    if( e.target.dontDrag) return; //For consistency with dontResize, cant really see why though for now
    dragObject  = e.target;
    if( dragObject.parentNode.id == "zool-panel" ){
      dragObject = dragObject.parentNode;
    }
    dragOffset = getDragOffset( dragObject , e );
    //Add on for the label offset
    if( dragObject.label ){
      dragOffset.labelxdelta = dragOffset.x - dragObject.label.left;
      dragOffset.labelydelta = dragOffset.y - dragObject.label.top;
    }
    return false;
  }

  //Evil evil, we only resize when the cursor is south, east or south-east
  //If the object doesnt want to resize ( e.target.dontResize ), then dont resize ( duh )
  function startResize( e ){
    if( e.target.style['cursor'] != "se-resize" && e.target.style['cursor'] != "s-resize" && e.target.style['cursor'] != "e-resize" ) return;
    if( e.target.dontResize) return;
    sizeObject  = e.target;
    if( sizeObject.resizeTarget ){
      sizeObject = sizeObject.resizeTarget;
    }
    sizeOffset = determineMouseCoordinates( e );
    sizeOffset.width  = sizeObject.width;
    sizeOffset.height = sizeObject.height;
    return false;
  }