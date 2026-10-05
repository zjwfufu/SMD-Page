/* Presentation-only punctuation policy. Raw experiment data and URL/code syntax
 * remain untouched. Native browser media controls are outside authored page copy.
 */
(() => {
  const marks=/[:;：；]/;
  const excluded='script,style,noscript,textarea,input,code,kbd,samp';
  const format=value=>value.replace(/View exact prompt/gi,'View prompt').replace(/[ \t]*[:：][ \t]*/g,' — ').replace(/[;；]/g,',');
  function text(node){
    if(!node.parentElement||node.parentElement.closest(excluded))return;
    const value=node.nodeValue;
    if(marks.test(value)||/View exact prompt/i.test(value))node.nodeValue=format(value);
  }
  function labels(element){
    if(element.matches(excluded)||element.closest(excluded))return;
    for(const name of ['aria-label','title','alt']){
      const value=element.getAttribute(name);
      if(value&&(marks.test(value)||/View exact prompt/i.test(value)))element.setAttribute(name,format(value));
    }
  }
  function scan(root){
    if(root.nodeType===Node.TEXT_NODE){text(root);return;}
    if(root.nodeType!==Node.ELEMENT_NODE||root.matches(excluded))return;
    labels(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;while((node=walker.nextNode()))text(node);
    root.querySelectorAll('[aria-label],[title],[alt]').forEach(labels);
  }
  scan(document.body);
  new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='characterData')text(record.target);
      else if(record.type==='attributes')labels(record.target);
      else record.addedNodes.forEach(scan);
    }
  }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','alt']});
})();
