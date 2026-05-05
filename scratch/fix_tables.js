const fs = require('fs');

function processTable(content, fnName, listVar, pageVar, tbodySelector) {
    const pattern = new RegExp(
        `(function ${fnName}\\(list\\)\\s*\\{[\\s\\S]*?)(const start = 0;\\s*const paginated = ${listVar}\\.slice\\(start, ${pageVar} \\* limit\\);)([\\s\\S]*?)(<tbody>\\s*)([\\s\\S]*?)(</tbody>)`,
        'm'
    );
    
    const match = content.match(pattern);
    if (!match) {
        console.log("Could not find " + fnName);
        return content;
    }
    
    const funcStart = match[1];
    const sliceLogic = match[2];
    const prefixHtml = match[3];
    const tbodyOpen = match[4];
    const mapLogicRaw = match[5]; // This is the ${...} part
    const tbodyClose = match[6];
    
    // We need to change the function signature
    const newFuncStart = funcStart.replace(
        `function ${fnName}(list) {`,
        `function ${fnName}(list, isAppend = false) {\n    if (list === true) {\n        isAppend = true;\n        list = null;\n    }`
    );
    
    // Change slice logic
    const newSliceLogic = `const start = (${pageVar} - 1) * limit;\n    const paginated = ${listVar}.slice(start, start + limit);`;
    
    // The map logic is inside a template string: `${paginated.length === 0 ? `...` : paginated.map(...).join('')}`
    // We need to extract what's inside ${ }
    // It's basically everything from the first non-whitespace character until the end.
    let cleanMapLogic = mapLogicRaw.trim();
    if (cleanMapLogic.startsWith('${') && cleanMapLogic.endsWith('}')) {
        cleanMapLogic = cleanMapLogic.substring(2, cleanMapLogic.length - 1);
    }
    
    const isAppendBlock = `
    const rowsHtml = paginated.length === 0 && !isAppend ? \`<tr><td colspan="15" style="text-align:center;color:var(--text-muted); padding:20px;">Ma'lumot yo'q</td></tr>\` :
        ${cleanMapLogic};

    if (isAppend) {
        const tbody = document.querySelector('${tbodySelector}');
        if (tbody) tbody.insertAdjacentHTML('beforeend', rowsHtml);
        const sentinel = document.getElementById('${pageVar}-sentinel');
        if (sentinel) sentinel.outerHTML = renderPageControls('${pageVar}', totalPages, '${fnName}');
        setTimeout(() => { attachInfiniteScroll('${pageVar}', totalPages, '${fnName}'); }, 100);
        return;
    }
`;
    
    const newContent = content.substring(0, match.index) + 
                       newFuncStart + newSliceLogic + isAppendBlock + prefixHtml + 
                       tbodyOpen + `                        \${rowsHtml}\n                    ` + tbodyClose + 
                       content.substring(match.index + match[0].length);
                       
    return newContent;
}

let content = fs.readFileSync('c:/go-projects/savdosklad/frontend/src/js/admin.js', 'utf8');

content = processTable(content, 'renderAdminRegionsTable', 'currentAdminRegions', 'adminRegionPage', '#admin-content tbody');
content = processTable(content, 'renderAdminDistrictsTable', 'currentAdminDistricts', 'adminDistrictPage', '#admin-content tbody');
content = processTable(content, 'renderAdminMarketsTable', 'currentAdminMarkets', 'adminMarketPage', '#admin-content tbody');

content = processTable(content, 'renderMpCategoriesTable', 'filteredMpCategoriesList', 'mpCategoryPage', '#page-content tbody');
content = processTable(content, 'renderMpProductsTable', 'filteredMpProductsList', 'mpProductPage', '#page-content tbody');
content = processTable(content, 'renderMpSalesTable', 'filteredMpSalesList', 'mpSalesPage', '#page-content tbody');

fs.writeFileSync('c:/go-projects/savdosklad/scratch/fix_append.js', content, 'utf8');
console.log('Done');
