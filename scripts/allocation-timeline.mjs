import { chromium } from '@playwright/test';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true,channel:'msedge'});
const page=await browser.newPage();await page.goto('http://localhost:4173');await page.waitForTimeout(5000);
const cdp=await page.context().newCDPSession(page);let chunks='',updates=0;
cdp.on('HeapProfiler.addHeapSnapshotChunk',({chunk})=>chunks+=chunk);
cdp.on('HeapProfiler.heapStatsUpdate',()=>updates++);
await cdp.send('HeapProfiler.enable');await cdp.send('HeapProfiler.startTrackingHeapObjects',{trackAllocations:true});
await page.waitForTimeout(5000);await cdp.send('HeapProfiler.stopTrackingHeapObjects',{reportProgress:false});
const snapshot=JSON.parse(chunks),fields=snapshot.snapshot.meta.trace_function_info_fields,infos=snapshot.trace_function_infos,strings=snapshot.strings;
const treeFields=snapshot.snapshot.meta.trace_node_fields,tree=snapshot.trace_tree,results=[];
function walk(nodes,path){for(let i=0;i<nodes.length;i+=treeFields.length){const index=nodes[i+treeFields.indexOf('function_info_index')]*fields.length;const name=strings[infos[index+fields.indexOf('name')]],url=strings[infos[index+fields.indexOf('script_name')]];const next=path.concat(name);const count=nodes[i+treeFields.indexOf('count')],size=nodes[i+treeFields.indexOf('size')];if(count&&url.includes('/assets/'))results.push({path:next.join(' > '),count,bytes:size});walk(nodes[i+treeFields.indexOf('children')],next);}}
walk(tree,[]);
fs.writeFileSync('screenshots/phase-1/optimized/allocation-timeline.json',JSON.stringify({durationSeconds:5,heapStatsUpdates:updates,method:'Chrome DevTools Protocol HeapProfiler allocation tracking',applicationAllocations:results},null,2));
await browser.close();
