'use client';

import { createClient } from "@/utils/supabase/client";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const handler = async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    // Handle CORS preflight request
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, accept-profile',
      },
    });
  }
  let requestData;
  try {
    requestData = await request.json();
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid JSON input' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const { netID } = requestData;
  if (!netID) {
    return new Response(JSON.stringify({ error: 'Missing netID' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // new code to add the date package was scanned to the email template
  const supabase = createClient();
  
  // Fetch all unclaimed packages for this user
  const { data: packages, error: packageError } = await supabase
    .from('packages')
    .select('package_identifier, date_added')
    .eq('claimed', false)
    .eq('user_id', netID)
    .order('date_added', { ascending: false });

  if (packageError) {
    return new Response(JSON.stringify({ error: 'Error fetching packages details' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // If no packages found
  if (!packages || packages.length === 0) {
    return new Response(JSON.stringify({ message: 'No packages found' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Create HTML for package list
  const packagesHTML = packages.map(pkg => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">
        ${pkg.package_identifier}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">
        ${new Date(pkg.date_added).toLocaleString()}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">
        <a href="https://qiekvvwcicienqtinxmo.supabase.co/functions/v1/claim-package?trackingID=${pkg.package_identifier}" 
           style="display: inline-block; padding: 5px 10px; background-color: #a27a52; color: #ffffff; text-decoration: none; border-radius: 4px;">
          Claim
        </a>
      </td>
    </tr>
  `).join('');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'mailroom@riceapps.org',
      to: netID+'@rice.edu',
      subject: 'Your Package Notifications',
      html: 
      
      `
      <head>
      <meta charset="UTF-8" />
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <!--[if !mso]><!-- -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <!--<![endif]-->
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="format-detection" content="date=no" />
      <meta name="format-detection" content="address=no" />
      <meta name="format-detection" content="email=no" />
      <meta name="x-apple-disable-message-reformatting" />
      <link href="https://fonts.googleapis.com/css?family=Fira+Sans:ital,wght@0,300;0,800" rel="stylesheet" />
      <title>Mailroom</title>
      <!-- Made with Postcards by Designmodo https://postcards.email/ -->
      <!--[if !mso]><!-- -->
      <style>
      /* cyrillic-ext */
              @font-face { font-family: 'Fira Sans'; font-style: normal; font-weight: 300; font-display: swap; src: local('Fira Sans Light'), local('FiraSans-Light'), url(https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnPKreSxf6Xl7Gl3LX.woff2) format('woff2'); unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F; }
              /* cyrillic */
              @font-face { font-family: 'Fira Sans'; font-style: normal; font-weight: 300; font-display: swap; src: local('Fira Sans Light'), local('FiraSans-Light'), url(https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnPKreQhf6Xl7Gl3LX.woff2) format('woff2'); unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
              /* latin-ext */
              @font-face { font-family: 'Fira Sans'; font-style: normal; font-weight: 300; font-display: swap; src: local('Fira Sans Light'), local('FiraSans-Light'), url(https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnPKreSBf6Xl7Gl3LX.woff2) format('woff2'); unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF; }
              /* latin */
              @font-face { font-family: 'Fira Sans'; font-style: normal; font-weight: 300; font-display: swap; src: local('Fira Sans Light'), local('FiraSans-Light'), url(https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnPKreRhf6Xl7Glw.woff2) format('woff2'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
                                                      /* cyrillic-ext */
              @font-face { font-family: 'Fira Sans'; font-style: normal; font-weight: 800; font-display: swap; src: local('Fira Sans ExtraBold'), local('FiraSans-ExtraBold'), url(https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnMK7eSxf6Xl7Gl3LX.woff2) format('woff2'); unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F; }
              /* cyrillic */
              @font-face { font-family: 'Fira Sans'; font-style: normal; font-weight: 800; font-display: swap; src: local('Fira Sans ExtraBold'), local('FiraSans-ExtraBold'), url(https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnMK7eQhf6Xl7Gl3LX.woff2) format('woff2'); unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
              /* latin-ext */
              @font-face { font-family: 'Fira Sans'; font-style: normal; font-weight: 800; font-display: swap; src: local('Fira Sans ExtraBold'), local('FiraSans-ExtraBold'), url(https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnMK7eSBf6Xl7Gl3LX.woff2) format('woff2'); unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF; }
              /* latin */
              @font-face { font-family: 'Fira Sans'; font-style: normal; font-weight: 800; font-display: swap; src: local('Fira Sans ExtraBold'), local('FiraSans-ExtraBold'), url(https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnMK7eRhf6Xl7Glw.woff2) format('woff2'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
      </style>
      <!--<![endif]-->
      <style>
      html,
              body {
                  margin: 0 !important;
                  padding: 0 !important;
                  min-height: 100% !important;
                  width: 100% !important;
                  -webkit-font-smoothing: antialiased;
              }
      
              * {
                  -ms-text-size-adjust: 100%;
              }
      
              #outlook a {
                  padding: 0;
              }
      
              .ReadMsgBody,
              .ExternalClass {
                  width: 100%;
              }
      
              .ExternalClass,
              .ExternalClass p,
              .ExternalClass td,
              .ExternalClass div,
              .ExternalClass span,
              .ExternalClass font {
                  line-height: 100%;
              }
      
              table,
              td,
              th {
                  mso-table-lspace: 0 !important;
                  mso-table-rspace: 0 !important;
                  border-collapse: collapse;
              }
      
              u + .body table, u + .body td, u + .body th {
                  will-change: transform;
              }
      
              body, td, th, p, div, li, a, span {
                  -webkit-text-size-adjust: 100%;
                  -ms-text-size-adjust: 100%;
                  mso-line-height-rule: exactly;
              }
      
              img {
                  border: 0;
                  outline: 0;
                  line-height: 100%;
                  text-decoration: none;
                  -ms-interpolation-mode: bicubic;
              }
      
              a[x-apple-data-detectors] {
                  color: inherit !important;
                  text-decoration: none !important;
              }
      
              .pc-gmail-fix {
                  display: none;
                  display: none !important;
              }
      
              .body .pc-project-body {
                  background-color: transparent !important;
              }
      
              @media (min-width: 621px) {
                  .pc-lg-hide {
                      display: none;
                  } 
      
                  .pc-lg-bg-img-hide {
                      background-image: none !important;
                  }
              }
      </style>
      <style>
      @media (max-width: 620px) {
      .pc-project-body {min-width: 0px !important;}
      .pc-project-container {width: 100% !important;}
      .pc-sm-hide {display: none !important;}
      .pc-sm-bg-img-hide {background-image: none !important;}
      table.pc-w620-spacing-0-0-40-0 {margin: 0px 0px 40px 0px !important;}
      td.pc-w620-spacing-0-0-40-0,th.pc-w620-spacing-0-0-40-0{margin: 0 !important;padding: 0px 0px 40px 0px !important;}
      .pc-w620-fontSize-30 {font-size: 30px !important;}
      .pc-w620-lineHeight-133pc {line-height: 133% !important;}
      .pc-w620-fontSize-16 {font-size: 16px !important;}
      .pc-w620-lineHeight-163pc {line-height: 163% !important;}
      .pc-w620-padding-35-35-35-35 {padding: 35px 35px 35px 35px !important;}
      
      .pc-w620-gridCollapsed-1 > tbody,.pc-w620-gridCollapsed-1 > tbody > tr,.pc-w620-gridCollapsed-1 > tr {display: inline-block !important;}
      .pc-w620-gridCollapsed-1.pc-width-fill > tbody,.pc-w620-gridCollapsed-1.pc-width-fill > tbody > tr,.pc-w620-gridCollapsed-1.pc-width-fill > tr {width: 100% !important;}
      .pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody > tr,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tr {width: 100% !important;}
      .pc-w620-gridCollapsed-1 > tbody > tr > td,.pc-w620-gridCollapsed-1 > tr > td {display: block !important;width: auto !important;padding-left: 0 !important;padding-right: 0 !important;margin-left: 0 !important;}
      .pc-w620-gridCollapsed-1.pc-width-fill > tbody > tr > td,.pc-w620-gridCollapsed-1.pc-width-fill > tr > td {width: 100% !important;}
      .pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody > tr > td,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tr > td {width: 100% !important;}
      .pc-w620-gridCollapsed-1 > tbody > .pc-grid-tr-first > .pc-grid-td-first,pc-w620-gridCollapsed-1 > .pc-grid-tr-first > .pc-grid-td-first {padding-top: 0 !important;}
      .pc-w620-gridCollapsed-1 > tbody > .pc-grid-tr-last > .pc-grid-td-last,pc-w620-gridCollapsed-1 > .pc-grid-tr-last > .pc-grid-td-last {padding-bottom: 0 !important;}
      
      .pc-w620-gridCollapsed-0 > tbody > .pc-grid-tr-first > td,.pc-w620-gridCollapsed-0 > .pc-grid-tr-first > td {padding-top: 0 !important;}
      .pc-w620-gridCollapsed-0 > tbody > .pc-grid-tr-last > td,.pc-w620-gridCollapsed-0 > .pc-grid-tr-last > td {padding-bottom: 0 !important;}
      .pc-w620-gridCollapsed-0 > tbody > tr > .pc-grid-td-first,.pc-w620-gridCollapsed-0 > tr > .pc-grid-td-first {padding-left: 0 !important;}
      .pc-w620-gridCollapsed-0 > tbody > tr > .pc-grid-td-last,.pc-w620-gridCollapsed-0 > tr > .pc-grid-td-last {padding-right: 0 !important;}
      
      .pc-w620-tableCollapsed-1 > tbody,.pc-w620-tableCollapsed-1 > tbody > tr,.pc-w620-tableCollapsed-1 > tr {display: block !important;}
      .pc-w620-tableCollapsed-1.pc-width-fill > tbody,.pc-w620-tableCollapsed-1.pc-width-fill > tbody > tr,.pc-w620-tableCollapsed-1.pc-width-fill > tr {width: 100% !important;}
      .pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody > tr,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tr {width: 100% !important;}
      .pc-w620-tableCollapsed-1 > tbody > tr > td,.pc-w620-tableCollapsed-1 > tr > td {display: block !important;width: auto !important;}
      .pc-w620-tableCollapsed-1.pc-width-fill > tbody > tr > td,.pc-w620-tableCollapsed-1.pc-width-fill > tr > td {width: 100% !important;box-sizing: border-box !important;}
      .pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody > tr > td,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tr > td {width: 100% !important;box-sizing: border-box !important;}
      }
      @media (max-width: 520px) {
      .pc-w520-padding-30-30-30-30 {padding: 30px 30px 30px 30px !important;}
      }
      </style>
      <!--[if !mso]><!-- -->
      <style>
      @font-face { font-family: 'Fira Sans'; font-style: normal; font-weight: 300; src: url('https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnPKreSBf8.woff') format('woff'), url('https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnPKreSBf6.woff2') format('woff2'); } @font-face { font-family: 'Fira Sans'; font-style: normal; font-weight: 800; src: url('https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnMK7eSBf8.woff') format('woff'), url('https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnMK7eSBf6.woff2') format('woff2'); }
      </style>
      <!--<![endif]-->
      <!--[if mso]>
          <style type="text/css">
              .pc-font-alt {
                  font-family: Arial, Helvetica, sans-serif !important;
              }
          </style>
          <![endif]-->
      <!--[if gte mso 9]>
          <xml>
              <o:OfficeDocumentSettings>
                  <o:AllowPNG/>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
          </xml>
          <![endif]-->
      </head>


      


      <body class="body pc-font-alt" style="width: 100% !important; min-height: 100% !important; margin: 0 !important; padding: 0 !important; line-height: 1.5; color: #2D3A41; mso-line-height-rule: exactly; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-variant-ligatures: normal; text-rendering: optimizeLegibility; -moz-osx-font-smoothing: grayscale; background-color: #f4f4f4;" bgcolor="#f4f4f4">
        <table class="pc-project-body" style="table-layout: fixed; min-width: 600px; background-color: #f4f4f4;" bgcolor="#f4f4f4" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
          <tr>
            <td align="center" valign="top">
              <table class="pc-project-container" align="center" width="600" style="width: 600px; max-width: 600px;" border="0" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding: 20px 0px 20px 0px;" align="left" valign="top">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="width: 100%;">
                      <tr>
                        <td valign="top">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                            <tr>
                              <td style="padding: 0px 0px 0px 0px;">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                  <tr>
                                    <td valign="top" class="pc-w520-padding-30-30-30-30 pc-w620-padding-35-35-35-35" style="padding: 40px 40px 40px 40px; border-radius: 0px; background-color: #1B1B1B;" bgcolor="#1B1B1B">
                                      <!-- Logo -->
                                      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                        <tr>
                                          <td class="pc-w620-spacing-0-0-40-0" align="center" valign="top" style="padding: 0px 0px 60px 0px;">
                                            <img src="https://cloudfilesdm.com/postcards/logo-white.png" width="125" height="25" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 125px; height: auto; max-width: 100%; border: 0;" />
                                          </td>
                                        </tr>
                                      </table>
                                      
                                      <!-- Title -->
                                      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                        <tr>
                                          <td align="center" valign="top">
                                            <div class="pc-font-alt pc-w620-fontSize-30" style="font-family: 'Fira Sans', Arial, Helvetica, sans-serif; font-size: 48px; font-weight: 800; line-height: 100%; letter-spacing: -0.6px; color: #ffffff;">
                                              Packages Delivered
                                            </div>
                                          </td>
                                        </tr>
                                      </table>

                                      <!-- Package List -->
                                      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 30px;">
                                        <tr>
                                          <td align="center" valign="top">
                                            <div class="pc-font-alt pc-w620-fontSize-16" style="font-family: 'Fira Sans', Arial, Helvetica, sans-serif; font-size: 18px; line-height: 156%; color: #ffffff;">
                                              <div style="margin-bottom: 20px;">Pickup your packages in the mailroom!</div>
                                              
                                              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                                                <tr style="border-bottom: 1px solid #ffffff;">
                                                  <th style="padding: 12px; text-align: left;">Tracking ID</th>
                                                  <th style="padding: 12px; text-align: left;">Delivered</th>
                                                  <th style="padding: 12px; text-align: center;">Action</th>
                                                </tr>
                                                ${packages.map(pkg => `
                                                  <tr style="border-bottom: 1px solid #3d3d3d;">
                                                    <td style="padding: 12px;">${pkg.package_identifier}</td>
                                                    <td style="padding: 12px;">${new Date(pkg.date_added).toLocaleString()}</td>
                                                    <td style="padding: 12px; text-align: center;">
                                                      <a href="https://qiekvvwcicienqtinxmo.supabase.co/functions/v1/claim-package?trackingID=${pkg.package_identifier}" 
                                                         style="display: inline-block; padding: 8px 15px; background-color: #a27a52; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px;">
                                                        Claim
                                                      </a>
                                                    </td>
                                                  </tr>
                                                `).join('')}
                                              </table>

                                              <div style="margin-top: 30px;">
                                                <p>If you no longer want to receive these notifications, you can 
                                                  <a href="https://qiekvvwcicienqtinxmo.supabase.co/functions/v1/unsubscribe-handler?netID=${netID}" 
                                                     style="color: #ffffff;">
                                                    unsubscribe here
                                                  </a>.
                                                </p>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- Fix for Gmail on iOS -->
        <div class="pc-gmail-fix" style="white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>
      </body>


           
           
           





      `,
    }),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

Deno.serve(handler);