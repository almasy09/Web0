/* app.js
   دوال مشابهة للنسخة الأولى لكن بأسماء مختلفة لتجنّب الشبه
   - يتم استخدام jQuery (مرفوع عبر CDN في صفحات)
*/

function readAsDataURL_File(f){
    return new Promise((resolve, reject) => {
      if (!f) return resolve(null);
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = () => reject('error reading file');
      fr.readAsDataURL(f);
    });
  }
  
  /* تحقق بسيط */
  function validateEntry(e){
    const errs = [];
    const nameRe = /^[A-Za-z]+$/;
    if (!e.name || !nameRe.test(e.name)) errs.push('الاسم لازم أحرف إنجليزية بدون فراغ');
    if (!e.maker || !nameRe.test(e.maker)) errs.push('اسم الشركة لازم أحرف إنجليزية بدون فراغ');
    try { new URL(e.url); } catch (_) { errs.push('رابط الموقع غير صالح'); }
    if (!e.category) errs.push('اختار مجال التطبيق');
    if (!e.desc || e.desc.length < 6) errs.push('اكتب وصف مختصر (أقلها 6 أحرف)');
    return errs;
  }
  
  /* storage helpers */
  function fetchApps_v2(){
    const raw = localStorage.getItem('mobi_apps_v2');
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
  }
  function storeApps_v2(list){
    localStorage.setItem('mobi_apps_v2', JSON.stringify(list));
  }
  function pushApp_v2(obj){
    const list = fetchApps_v2();
    list.push(obj);
    storeApps_v2(list);
  }
  
  /* render table */
  function drawAppsTable($tbody){
    const apps = fetchApps_v2();
    $tbody.empty();
    if (apps.length === 0){
      $tbody.append(`<tr><td colspan="6" style="padding:18px;color:var(--muted)">لا توجد تطبيقات مضيفة بعد.</td></tr>`);
      return;
    }
  
    apps.forEach((app, idx) => {
      const tr = $(`
        <tr>
          <td><button class="btnView" data-idx="${idx}">عرض</button></td>
          <td>${escapeHtml(app.name)}</td>
          <td>${escapeHtml(app.maker)}</td>
          <td>${app.free ? 'نعم' : 'لا'}</td>
          <td>${escapeHtml(app.category)}</td>
          <td><a href="${app.url}" target="_blank" rel="noopener">الموقع</a></td>
        </tr>
      `);
      const det = $(`
        <tr class="detailsRow" style="display:none;">
          <td colspan="6">
            <div>
              <strong>الوصف:</strong> ${escapeHtml(app.desc)}
              ${app.logo ? `<div><img src="${app.logo}" alt="logo" style="max-width:180px;border-radius:8px;margin-top:8px;"></div>` : ''}
            </div>
          </td>
        </tr>
      `);
      $tbody.append(tr).append(det);
    });
  
    $('.btnView').off('click').on('click', function(){
      const idx = $(this).data('idx');
      const next = $(this).closest('tr').next('.detailsRow');
      next.toggle();
    });
  }
  
  function escapeHtml(s){ return $('<div>').text(s).html(); }
  
  function seedIfEmpty_v2(){
    if (fetchApps_v2().length === 0){
      storeApps_v2([
        { name: "DemoApp", maker: "DemoCo", url: "https://example.com", free: true, category: "Education", desc: "تطبيق تجريبي", logo: null }
      ]);
    }
  }
  
  /* page specific initializations */
  $(function(){
    // إذا الصفحة فيها جدول التطبيقات
    if ($('#appsBody').length){
      seedIfEmpty_v2();
      drawAppsTable($('#appsBody'));
    }
  
    // صفحة إضافة التطبيق
    if ($('#newAppForm').length){
      $('#newAppForm').on('submit', async function(e){
        e.preventDefault();
        $('#formErrors').text('');
        const name = $('#app_name').val().trim();
        const maker = $('#app_maker').val().trim();
        const url = $('#app_url').val().trim();
        const free = $('input[name="app_free"]:checked').val() === 'true';
        const category = $('#app_category').val();
        const desc = $('#app_desc').val().trim();
        const logoF = $('#app_logo')[0].files[0];
  
        const logo = await readAsDataURL_File(logoF);
        const entry = { name, maker, url, free, category, desc, logo };
  
        const errors = validateEntry(entry);
        if (errors.length){
          $('#formErrors').html(errors.map(x => `- ${x}`).join('<br>'));
          return;
        }
  
        pushApp_v2(entry);
        // بعد الحفظ نروح لصفحة apps
        window.location.href = 'apps.html';
      });
    }
  });
  