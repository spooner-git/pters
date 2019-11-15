// class Base_nav{
//     constructor(pc, mobile){
//         let target = {install:{pc:pc, mobile:mobile}};

//     }

//     init(){

//     }

//     dom_mobile_assembly(){
//         let home = this.dom_mobile_home();
//         let calendar = this.dom_mobile_calendar();
//         let member = this.dom_mobile_member();
//         let notification = this.dom_mobile_notification();
//         let menu = this.dom_mobile_menu();


//         let assembly = home + calendar + member + notification + menu;

//         return assembly;
//     }

//     dom_mobile_home(){
//         let html = `<div class="obj_table_cell_x5 nav_item" onclick="sideGoPage('home', this)" id="home">
//                         <div class="nav_img">
//                             <svg style="vertical-align:middle" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
//                                 <g id="cimg_home" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
//                                     <polygon id="Path-14" fill="var(--img-main)" points="12 4 21 13 21 23 23 23 23 12 12 1 1 12 1 23 3 23 3 13"></polygon>
//                                 </g>
//                             </svg>
//                             <!-- <img src={% static_url "common/icon/tab_bar/icon_home_off.png" %} alt=""> -->
//                         </div>
//                     </div>`;
//         return html;
//     }

//     dom_mobile_calendar(){
//         let html = `<div class="obj_table_cell_x5 nav_item" onclick="sideGoPage('calendar', this)" id="calendar">
//                         <div class="nav_img">
//                             <svg style="vertical-align:middle" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
//                                 <g id="cimg_calendar" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
//                                     <path id="Combined-Shape" fill="var(--img-main)" d="M8.00051832,0.5 L8.00051832,2.5 L16.0005183,2.5 L16.0005183,0.5 L18.0005183,0.5 L18.0005183,2.5 L22.5005186,2.5 L22.5010362,21.5054385 C22.5010663,22.6070044 21.5986976,23.5 20.5064204,23.5 L3.49461578,23.5 C2.39298985,23.5 1.4999702,22.5976562 1.5,21.5054385 L1.50051858,2.5 L6.00051832,2.5 L6.00051832,0.5 L8.00051832,0.5 Z M20.4998853,4.5 L3.49988534,4.5 L3.49988534,21.5 L20.4998853,21.5 L20.4998853,4.5 Z M7.99988558,17 C8.55217033,17 8.99988558,17.4477153 8.99988558,18 C8.99988558,18.5522847 8.55217033,19 7.99988558,19 C7.44760083,19 6.99988558,18.5522847 6.99988558,18 C6.99988558,17.4477153 7.44760083,17 7.99988558,17 Z M11.9998856,17 C12.5521703,17 12.9998856,17.4477153 12.9998856,18 C12.9998856,18.5522847 12.5521703,19 11.9998856,19 C11.4476008,19 10.9998856,18.5522847 10.9998856,18 C10.9998856,17.4477153 11.4476008,17 11.9998856,17 Z M15.9998856,17 C16.5521703,17 16.9998856,17.4477153 16.9998856,18 C16.9998856,18.5522847 16.5521703,19 15.9998856,19 C15.4476008,19 14.9998856,18.5522847 14.9998856,18 C14.9998856,17.4477153 15.4476008,17 15.9998856,17 Z M7.99988558,13 C8.55217033,13 8.99988558,13.4477153 8.99988558,14 C8.99988558,14.5522847 8.55217033,15 7.99988558,15 C7.44760083,15 6.99988558,14.5522847 6.99988558,14 C6.99988558,13.4477153 7.44760083,13 7.99988558,13 Z M11.9998856,13 C12.5521703,13 12.9998856,13.4477153 12.9998856,14 C12.9998856,14.5522847 12.5521703,15 11.9998856,15 C11.4476008,15 10.9998856,14.5522847 10.9998856,14 C10.9998856,13.4477153 11.4476008,13 11.9998856,13 Z M15.9998856,13 C16.5521703,13 16.9998856,13.4477153 16.9998856,14 C16.9998856,14.5522847 16.5521703,15 15.9998856,15 C15.4476008,15 14.9998856,14.5522847 14.9998856,14 C14.9998856,13.4477153 15.4476008,13 15.9998856,13 Z"></path>
//                                 </g>
//                             </svg>
//                             <!-- <img src={% static_url "common/icon/tab_bar/icon_calendar_off.png" %} alt=""> -->
//                         </div>
//                     </div>`;
//         return html;
//     }

//     dom_mobile_member(){
//         let html = `<div class="obj_table_cell_x5 nav_item" onclick="sideGoPage('member', this)" id="member">
//                         <div class="nav_img">
//                             <svg style="vertical-align:middle" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
//                                 <g id="cimg_member" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
//                                     <path id="Combined-Shape" fill="var(--img-main)" d="M11.9910643,3.00003143 C10.3386013,2.99568275 8.99554913,4.33917449 9.00003342,5.99230661 C9.00451676,7.64508415 10.3549209,8.99561996 12.0073398,8.99996853 C13.6609335,9.00432019 15.00445,7.66089511 14.9999666,6.00809626 C14.9954823,4.35494282 13.6447021,3.00438321 11.9910643,3.00003143 Z M11.9990507,11 C9.2427378,11 7,8.75668107 7,6.00023734 C7,3.24331893 9.2427378,1 11.9990507,1 C14.7567875,1 17,3.24331893 17,6.00023734 C17,8.75668107 14.7567875,11 11.9990507,11 Z M6,23 C6,23 6,23 7.5,17 C8.25,14 10.5,14 10.5,14 L13.5,14 C13.5,14 15.75,14 16.5,17 C18,23 18,23 18,23 L20,23 C20,23 20,23 18.5,17 C17.25,12 13.5,12 13.5,12 L10.5,12 C10.5,12 6.75,12 5.5,17 C4,23 4,23 4,23 L6,23 Z"></path>
//                                 </g>
//                             </svg>
//                             <!-- <img src={% static_url "common/icon/tab_bar/icon_member_off.png" %} alt=""> -->
//                         </div>
//                     </div>`;
//         return html;
//     }

//     dom_mobile_notification(){
//         let html = `<div class="obj_table_cell_x5 nav_item" onclick="sideGoPage('alarm', this)" id="alarm">
//                         <div class="nav_img">
//                             <svg style="vertical-align:middle"  width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
//                                 <defs>
//                                     <path d="M17.7,16.5 L16,13.5 L16,7.5 C16,7.5 16,3.5 13,3.5 L11,3.5 C8,3.5 8,7.5 8,7.5 L8,13.5 L6.3,16.5 L17.7,16.5 Z M18,13.5 L21,18.5 L3,18.5 L6,13.5 L6,7.5 C6,7.5 6,1.5 11,1.5 L13,1.5 C18,1.5 18,7.5 18,7.5 L18,13.5 Z M11,18.5 L11,19.5733333 C11,20.3911111 11.3333333,20.8 12,20.8 C12.6666667,20.8 13,20.3911111 13,19.5733333 L13,18.5 L11,18.5 Z M9,19.2692308 L9,16.5 L15,16.5 L15,19.2692308 C15,21.4230769 14,22.5 12,22.5 C10,22.5 9,21.4230769 9,19.2692308 Z" id="path-1"></path>
//                                 </defs>
//                                 <g id="cimg_notification" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
//                                     <mask id="mask-2" fill="white">
//                                         <use xlink:href="#path-1"></use>
//                                     </mask>
//                                     <use id="Combined-Shape" fill="var(--img-main)" fill-rule="nonzero" xlink:href="#path-1"></use>
//                                 </g>
//                             </svg>
//                             <!-- <img src={% static_url "common/icon/tab_bar/icon_alarm_off.png" %} alt=""> -->
//                             <div class="new_alarm_indicator"></div>
//                         </div>
//                     </div>`;
//         return html;
//     }
    
//     dom_mobile_menu(){
//         let html = `<div class="obj_table_cell_x5 nav_item" onclick="sideGoPage('menu', this)" id="menu">
//                         <div class="nav_img">
//                             <svg style="vertical-align:middle"  width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
//                                 <g id="cimg_menu" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
//                                     <path id="Combined-Shape" fill="var(--img-main)" d="M21,18 L21,20 L3,20 L3,18 L21,18 Z M21,11 L21,13 L3,13 L3,11 L21,11 Z M21,4 L21,6 L3,6 L3,4 L21,4 Z"></path>
//                                 </g>
//                             </svg>
//                             <!-- <img src={% static_url "common/icon/tab_bar/icon_menu_off.png" %} alt=""> -->
//                         </div>
//                     </div>`;
//         return html;
//     }


// }