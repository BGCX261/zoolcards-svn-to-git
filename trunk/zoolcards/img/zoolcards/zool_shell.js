/********************************************************************************************************************************************\
|* Zool cards by Konijn                                                                                                                     *|
|* Copyright (C) 2008 Konijn                                                                                                                *|
|*                                                                                                                                          *|
|* This program is free software; you can redistribute it and/or modify it under the terms of the GNU GPL Version 2 as published by the FSF *|
|* See copying.txt                                                                                                                          *|
|* Dedicated to Segolene de Basquiat                                                                                                        *|
\********************************************************************************************************************************************/

//Idea stolen straight from js shell
function props(o){

  var s = "";

    for( var a in o ){
      try
      {
        if( typeof a != "function" && (typeof o[a]) != "function" ){
          if( typeof o[a] == "string" || typeof o[a] == "number" ){
            addPropertyValue2Tree( treeChildren , a  , o[a] );
            s = s + "[" + a + ":" + o[a] + "]";
          }else if( typeof o[a] == "object" ){
            s = s + "[" + a + ":" + o[a] + "]";
          }else{
            var o = addPropertyValue2Tree( treeChildren , a  , typeof o[a] + ":" + o[a]  );
            s = s + "[" + a + ":" + o[a] + "]";
          }
        }
      }
      catch (er) { }
    }

    return s;
}


