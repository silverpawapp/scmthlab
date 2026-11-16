/* 理科・算数ラボ 共通：タブ切り替え・電波なしで使うしくみ（Service Worker）の登録 */
(function(){
"use strict";
// タブ：<div class="tabs" role="tablist"> の button[data-pane] と、id が一致する .pane を切り替える
window.LabTabs = function(onChange){
  const tabs=[...document.querySelectorAll('.tabs [role="tab"]')];
  function show(id){
    tabs.forEach(t=>{const on=t.dataset.pane===id;t.setAttribute("aria-selected",on?"true":"false");t.tabIndex=on?0:-1;
      const p=document.getElementById(t.dataset.pane);if(p)p.hidden=!on;});
    if(onChange) onChange(id);
  }
  tabs.forEach(t=>t.addEventListener("click",()=>show(t.dataset.pane)));
  if(tabs.length) show(tabs[0].dataset.pane);
  return show;
};

// Service Worker（ページの場所から見て、アプリのいちばん上の sw.js を使う）
if("serviceWorker" in navigator && location.protocol!=="file:"){
  const root=document.documentElement.dataset.root||"./";
  window.addEventListener("load",()=>{
    navigator.serviceWorker.register(root+"sw.js",{scope:root}).then(reg=>{
      const bar=document.getElementById("update");
      const offer=w=>{ if(!bar) return; bar.hidden=false;
        document.getElementById("updateBtn").onclick=()=>w.postMessage("skip"); };
      if(reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener("updatefound",()=>{const w=reg.installing; if(!w) return;
        w.addEventListener("statechange",()=>{ if(w.state==="installed" && navigator.serviceWorker.controller) offer(w); });});
    }).catch(()=>{});
    let reloaded=false;
    navigator.serviceWorker.addEventListener("controllerchange",()=>{ if(reloaded) return; reloaded=true; location.reload(); });
  });
}
})();
