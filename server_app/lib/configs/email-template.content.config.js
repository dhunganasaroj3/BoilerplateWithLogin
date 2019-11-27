/**
 * Created by lakhe on 10/10/17.
 */
(() => {
    'use strict';

    module.exports = {
        'system_emails': `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
                "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                
                <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
                
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                    <title>Xceltrip</title>
                    <link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet">
                    <style>
                        body {
                            font-family: "Montserrat";
                        }
                    </style>
                </head>
                
                <body style="padding:0;
                margin:0 !important;
                width: 100% !important;
                -webkit-text-size-adjust: 100% !important;
                -ms-text-size-adjust: 100% !important; background-color:#fff;
                -webkit-font-smoothing: antialiased !important;">
                    <table style="margin:0 auto;max-width:700px;">
                        <tbody>
                            <tr>
                                <td>
                                <img style="max-width: 150px;" src="https://s3.amazonaws.com/xceltrip/logo.png" alt="xceltrip" /></td>
                            </tr>
                            <tr>
                                <td style="padding:20px; color:#333; font-family: " Montserrat ";">
                                    %email_content%
                                </td>
                            </tr>
                            <tr style="background-color:#f0f0f0; color:#333; font-size:12px; font-family: " Montserrat ";">
                                <td>
                                    <table style="width:100%;">
                <tbody>
                                            <td align="center">
                                                <div style="display:inline-block;">
                                                    <table>
                <tbody>
                
                                                        <tr>
                                                            <td colspan="2" align="center" style="padding-top: 30px; vertical-align: bottom;"><a href="mailto:feedback@xceltrip.com" style="color:#333;">support&#64;xceltrip&#46;com</a>
                                        </td>
                                    </tr>
                                                    </tbody>
                                    </table>
                                                </div>
                                            </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top:30px; text-align:center;" align="center">
                                                    <b>CONNECT WITH US</b>
                                                    <br/>
                                                    <ul style="display:inline-block; padding-left:0; margin-left:0;">
                                                        <li style="display:inline-block; list-style:none; margin-right:10px;">
                                                            <a href="https://www.youtube.com/channel/UCz50jspk5omNAemibgpoiVg" target="_blank">
                                                                <img style="width: 26px;" src="https://s3.amazonaws.com/xceltrip/youtube_icon.png" alt="" /> </a>
                                                        </li>
                                                        <li style="display:inline-block; list-style:none; margin-right:10px;">
                                                            <a href="https://www.facebook.com/XcelTripGo/" target="_blank">
                                                                <img style="width: 20px;" src="https://s3.amazonaws.com/xceltrip/facebook_icon.png" alt="" /></a>
                                                        </li>
                                                        <li style="display:inline-block; list-style:none; margin-right:10px;">
                                                            <a target="_blank" href="https://www.linkedin.com/company/13435327/">
                                        <img style="width: 20px;" src="https://s3.amazonaws.com/xceltrip/linkedin_icon.png" alt="" /></a>
                                                        </li>
                                                        <li style="display:inline-block; list-style:none; margin-right:10px;">
                                                            <a href="https://twitter.com/xceltrip" target="_blank">
                                        <img style="width: 20px;" src="https://s3.amazonaws.com/xceltrip/twitter_icon.png" alt="" /></a>
                                                        </li>
                                                    </ul>
                                                </td>
                                            </tr>
                                            <tr style="text-align:center; ">
                                                <td style="text-justify:center; color:#808080; font-size:10px;padding-bottom:15px;">©2018 XcelTrip® Pte. All Rights Reserved</td>
                                            </tr>
                </tbody>
                                                    </table>
                                </td>
                                </tr>
                        </tbody>
                        </table>
                
                </body>
                
                </html>
        `,
        'subscription_emails': `
            
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
                "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                
                <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
                
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                    <title>Xceltrip</title>
                    <link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet">
                    <style>
                        body {
                            font-family: "Montserrat";
                        }
                    </style>
                </head>
                
                <body style="padding:0;
                margin:0 !important;
                width: 100% !important;
                -webkit-text-size-adjust: 100% !important;
                -ms-text-size-adjust: 100% !important; background-color:#fff;
                -webkit-font-smoothing: antialiased !important;">
                    <table style="margin:0 auto;">
                        <tbody>
                            <tr>
                                <td>
                                    <img style="width:100%;max-width: 700px;" src="https://s3.amazonaws.com/xceltrip/header.jpg" alt="xceltrip" /></td>
                            </tr>
                            <tr>
                                <td style="padding:20px; color:#333; font-family: " Montserrat ";">
                                    %email_content%
                                </td>
                            </tr>
                            <tr style="background-color:#f0f0f0; color:#333; font-size:12px; font-family: " Montserrat ";">
                                <td>
                                    <table style="width:100%;">
                <tbody>
                                        <tr>
                
                                            <td align="center">
                                                <div style="display:inline-block;">
                                                    <table>
                <tbody>
                
                                                        <tr>
                                                            <td colspan="2" align="center" style="padding-top: 30px; vertical-align: bottom;"><a href="mailto:feedback@xceltrip.com" style="color:#333;">support&#64;xceltrip&#46;com</a>
                                        </td>
                                    </tr>
                                                    </tbody>
                                    </table>
                                                </div>
                                            </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top:30px; text-align:center;" align="center">
                                                    <b>CONNECT WITH US</b>
                                                    <br/>
                                                    <ul style="display:inline-block; padding-left:0; margin-left:0;">
                                                        <li style="display:inline-block; list-style:none; margin-right:10px;">
                                                            <a href="https://www.youtube.com/channel/UCz50jspk5omNAemibgpoiVg" target="_blank">
                                                                <img style="width: 26px;" src="https://s3.amazonaws.com/xceltrip/youtube_icon.png" alt="" /> </a>
                                                        </li>
                                                        <li style="display:inline-block; list-style:none; margin-right:10px;">
                                                            <a href="https://www.facebook.com/XcelTripGo/" target="_blank">
                                                                <img style="width: 20px;" src="https://s3.amazonaws.com/xceltrip/facebook_icon.png" alt="" /></a>
                                                        </li>
                                                        <li style="display:inline-block; list-style:none; margin-right:10px;">
                                                            <a target="_blank" href="https://www.linkedin.com/company/13435327/">
                                        <img style="width: 20px;" src="https://s3.amazonaws.com/xceltrip/linkedin_icon.png" alt="" /></a>
                                                        </li>
                                                        <li style="display:inline-block; list-style:none; margin-right:10px;">
                                                            <a href="https://twitter.com/xceltrip" target="_blank">
                                        <img style="width: 20px;" src="https://s3.amazonaws.com/xceltrip/twitter_icon.png" alt="" /></a>
                                                        </li>
                                                    </ul>
                                                </td>
                                            </tr>
                                            <tr style="text-align:center; ">
                                                <td style="text-justify:center; color:#808080; font-size:10px;padding-bottom:15px;">©2018 XcelTrip® Pte. All Rights Reserved</td>
                                            </tr>
                </tbody>
                                                    </table>
                                </td>
                                </tr>
                        </tbody>
                        </table>
                
                </body>
                
                </html>
        `
    };

})();
