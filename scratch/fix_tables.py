import re

def process_table(content, fn_name, list_var, page_var, tbody_selector):
    # Find the function definition
    pattern = re.compile(
        r'(function ' + fn_name + r'\(list\) \{)\s*'
        r'(if \(Array\.isArray\(list\)\) \{[\s\S]*?\}\s*)'
        r'(const limit = 10;[\s\S]*?)'
        r'(const start = 0;\s*const paginated = ' + list_var + r'\.slice\(start, ' + page_var + r' \* limit\);)\s*'
        r'(const container = document\.getElementById\([^\)]+\);\s*container\.innerHTML = `[\s\S]*?<tbody>)\s*'
        r'(\$\{.*?\? `.*?` :[\s\S]*?\.map\([\s\S]*?\)\.join\(\'\'\)\})\s*'
        r'(</tbody>[\s\S]*?)(setTimeout\(\(\) => \{ attachInfiniteScroll[^\}]+\}, 100\);\s*\})',
        re.MULTILINE
    )
    
    match = pattern.search(content)
    if not match:
        print(f"Could not find {fn_name}")
        return content
        
    func_start = match.group(1)
    array_check = match.group(2)
    limit_calc = match.group(3)
    slice_logic = match.group(4)
    prefix_html = match.group(5)
    map_logic = match.group(6)
    suffix_html = match.group(7)
    timeout_logic = match.group(8)
    
    # We need to change the function signature and add isAppend logic
    new_func_start = f'function {fn_name}(list, isAppend = false) {{\n    if (list === true) {{\n        isAppend = true;\n        list = null;\n    }}\n'
    
    # We need to revert slice logic to only get the NEW items for appending, but if NOT appending, we still just get page 1.
    # Actually, if we use isAppend, `start` should be `(page - 1) * limit`.
    new_slice_logic = f'    const start = ({page_var} - 1) * limit;\n    const paginated = {list_var}.slice(start, start + limit);\n'
    
    # We extract the row generation logic
    # The map_logic has `${paginated.length === 0 ? `...` : paginated.map(...).join('')}`
    
    # Create the isAppend block
    is_append_block = f"""
    let rowsHtml = '';
    if (paginated.length === 0 && !isAppend) {{
        rowsHtml = `<tr><td colspan="15" style="text-align:center;color:var(--text-muted); padding:20px;">Hech narsa topilmadi</td></tr>`;
    }} else {{
        // We need to extract just the map part, but it's easier to just use the existing map logic 
        // Wait, the existing map logic is a template string expression. 
        // We can just evaluate it inside JS.
        rowsHtml = {map_logic.strip()[2:-1]}; // Remove ${{ and }}
    }}

    if (isAppend) {{
        const tbody = document.querySelector('{tbody_selector}');
        if (tbody) tbody.insertAdjacentHTML('beforeend', rowsHtml);
        
        // Update sentinel
        const sentinel = document.getElementById('{page_var}-sentinel');
        if (sentinel) {{
            sentinel.outerHTML = renderPageControls('{page_var}', totalPages, '{fn_name}');
        }}
        {timeout_logic.replace('}', '').strip()}
        return;
    }}
"""
    
    # Reconstruct the HTML
    new_prefix_html = prefix_html
    new_html = new_prefix_html + '\n                        ${rowsHtml}\n' + suffix_html
    
    new_content = content[:match.start()] + new_func_start + array_check + limit_calc + new_slice_logic + is_append_block + new_html + timeout_logic + content[match.end():]
    
    return new_content

def main():
    with open('c:/go-projects/savdosklad/frontend/src/js/admin.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Note: tbody_selector must uniquely identify the tbody for the specific table.
    # Since admin.js uses `admin-content` or `page-content`, we can just use `#admin-content tbody` or `#page-content tbody`
    
    content = process_table(content, 'renderAdminUsersTable', 'currentAdminUsers', 'adminUserPage', '#admin-content tbody')
    content = process_table(content, 'renderAdminRegionsTable', 'currentAdminRegions', 'adminRegionPage', '#admin-content tbody')
    content = process_table(content, 'renderAdminDistrictsTable', 'currentAdminDistricts', 'adminDistrictPage', '#admin-content tbody')
    content = process_table(content, 'renderAdminMarketsTable', 'currentAdminMarkets', 'adminMarketPage', '#admin-content tbody')
    
    content = process_table(content, 'renderMpCategoriesTable', 'filteredMpCategoriesList', 'mpCategoryPage', '#page-content tbody')
    content = process_table(content, 'renderMpProductsTable', 'filteredMpProductsList', 'mpProductPage', '#page-content tbody')
    content = process_table(content, 'renderMpSalesTable', 'filteredMpSalesList', 'mpSalesPage', '#page-content tbody')

    with open('c:/go-projects/savdosklad/scratch/fix_append.js', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()
