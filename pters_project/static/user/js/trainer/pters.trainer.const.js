/**
 * Created by Hyunki on 06/02/2019.
 */
const OPEN = "open";
const CLOSE = "close";
const ALL_CLOSE = "all_close";
const STATE_IN_PROGRESS = "IP";
const STATE_END_PROGRESS = "PE";

const ON = 1;
const OFF = 0;

const DEACTIVATE = 0;
const ACTIVATE = 0;

const CONFIRM = 1;
const CANCEL = 0;

const UNCONNECTED = 0;
const CONNECT_WAIT = 1;
const CONNECTED = 2;

const AUTH_TYPE_VIEW = 'VIEW';
const AUTH_TYPE_DELETE = 'DELETE';
const AUTH_TYPE_WAIT = 'WAIT';

const PROGRAM_SELECT = 0;
const PROGRAM_LECTURE_CONNECT_ACCEPT = 1;
const PROGRAM_LECTURE_CONNECT_DELETE = 2;

const PROGRAM_SELECTED = 'SELECTED';
const PROGRAM_NOT_SELECTED = 'NOT_SELECTED';

const POPUP_INNER_HTML = 0;
const POPUP_AJAX_CALL = 1;
const POPUP_BASIC = 2;

const ANIMATION_OFF = 0;
const ANIMATION_ON = 1;

const POPUP_SIZE_WINDOW = 0;

const SHOW = 'show';
const HIDE = 'hide';
const NONE = 'None';


const CALL_AJAX = 0;
const CALL_PAGE_MOVE = 1;

const POPUP_FROM_LEFT = 0;
const POPUP_FROM_RIGHT = 1;
const POPUP_FROM_BOTTOM = 2;
const POPUP_FROM_TOP = 3;
const POPUP_FROM_PAGE = 4;
const POPUP_FROM_PAGE_70 = 5;
const POPUP_FROM_PAGE_50 = 6;

const SHORT = 'short';
const LONG = 'long';

const ADD = 'add';
const READ = 'read';
const UPDATE = 'update';
const DELETE = 'delete';

const IOS = 'ios';
const ANDROID = 'android';
const WINDOW = 'window';

const PC = 'pc';
const MOBILE = 'mobile';

const SAFARI = 'safari';
const FIREFOX = 'firefox';
const CHROME = 'chrome';
const EDGE = 'edge';

const CARD = "card";
const IAP = "iap";
const PERIOD = "PERIOD";
const SINGLE = "SINGLE";

// const SCHEDULE_NOT_FINISH = 0;
// const SCHEDULE_FINISH = 1;
// const SCHEDULE_ABSENCE = 2;
// const SCHEDULE_ALL = 3;
// const SCHEDULE_FINISH_ANYWAY = 4;

const SCHEDULE_NOT_FINISH = 'NP';
const SCHEDULE_FINISH = 'PE';
const SCHEDULE_ABSENCE = 'PC';
const SCHEDULE_ALL = 3;
const SCHEDULE_FINISH_ANYWAY = 4;

const AUTOCOMPLETE_ATTEND = 1;
const AUTOCOMPLETE_ABSENCE = 2;
const AUTOCOMPLETE_CANCEL = 3;

const FIX = 'FIX';


/* 정렬 관련된 값 */
const SORT_MEMBER_NAME = 0;
const SORT_REMAIN_COUNT = 1;
const SORT_START_DATE = 2;
const SORT_REG_COUNT = 3;


const SORT_LECTURE_NAME = 0;
const SORT_LECTURE_MEMBER_COUNT = 1;
const SORT_LECTURE_CAPACITY_COUNT = 2;
const SORT_LECTURE_CREATE_DATE = 3;

const SORT_TICKET_TYPE = 0;
const SORT_TICKET_NAME = 1;
const SORT_TICKET_MEMBER_COUNT = 2;
const SORT_TICKET_CREATE_DATE = 3;

const SORT_ORDER_ASC = 0;
const SORT_ORDER_DESC = 1;

/* px */
const MAX_WIDTH = 800;

/**/

/* 공지사항 type */
const NOTICE = 'NOTICE';
const NOTICE_FAQ = 'FAQ';
const NOTICE_USAGE = 'SYS_USAGE';


/* 팝업 주소 */

// 풀페이지 팝업
const POPUP_ADDRESS_PLAN_VIEW = 'popup_plan_view';
const POPUP_ADDRESS_PLAN_ADD = 'popup_plan_add';
const POPUP_ADDRESS_PLAN_REPEAT_LIST = 'popup_plan_repeat_list';

const POPUP_ADDRESS_MEMBER_VIEW = 'popup_member_view';
const POPUP_ADDRESS_MEMBER_SIMPLE_VIEW = 'popup_member_simple_view';
const POPUP_ADDRESS_MEMBER_ADD = 'popup_member_add';
const POPUP_ADDRESS_MEMBER_EDIT = 'popup_member_edit';
const POPUP_ADDRESS_MEMBER_SEARCH = 'popup_member_search';

const POPUP_ADDRESS_LECTURE_VIEW = 'popup_lecture_view';
const POPUP_ADDRESS_LECTURE_SIMPLE_VIEW = 'popup_lecture_simple_view';
const POPUP_ADDRESS_LECTURE_ADD = 'popup_lecture_add';
const POPUP_ADDRESS_LECTURE_EDIT = 'popup_lecture_edit';
const POPUP_ADDRESS_LECTURE_LIST = 'popup_lecture_list';

const POPUP_ADDRESS_TICKET_VIEW = 'popup_ticket_view';
const POPUP_ADDRESS_TICKET_SIMPLE_VIEW = 'popup_ticket_simple_view';
const POPUP_ADDRESS_TICKET_ADD = 'popup_ticket_add';
const POPUP_ADDRESS_TICKET_EDIT = 'popup_ticket_edit';
const POPUP_ADDRESS_TICKET_LIST = 'popup_ticket_list';

const POPUP_MEMBER_SCHEDULE_HISTORY = 'popup_member_schedule_history';
const POPUP_MEMBER_TICKET_HISTORY = 'popup_member_ticket_history';
const POPUP_MEMBER_TICKET_MODIFY = 'popup_member_ticket_modify';
const POPUP_MEMBER_TICKET_REFUND = 'popup_member_ticket_refund';

const POPUP_ADDRESS_MEMBER_ATTEND = 'popup_member_attend';
const POPUP_ADDRESS_STATISTICS = 'popup_statistics';
const POPUP_ADDRESS_STATISTICS_DETAIL = 'popup_statistics_detail';

const POPUP_ADDRESS_PROGRAM_LIST = 'popup_program_list';
const POPUP_ADDRESS_PROGRAM_ADD = 'popup_program_add';
const POPUP_ADDRESS_PROGRAM_VIEW = 'popup_program_view';

const POPUP_ADDRESS_SETTING_WORKTIME = 'popup_setting_worktime';
const POPUP_ADDRESS_SETTING_AUTOCOMPLETE = 'popup_setting_autocomplete';
const POPUP_ADDRESS_SETTING_RESERVE = 'popup_setting_reserve';
const POPUP_ADDRESS_SETTING_ALARM = 'popup_setting_alarm';
const POPUP_ADDRESS_SETTING_ATTENDMODE = 'popup_setting_attendmode';
const POPUP_ADDRESS_SERVICE_NOTICE = 'popup_service_notice';
const POPUP_ADDRESS_SERVICE_INQUIRY_MENU = 'popup_service_inquiry_menu';
const POPUP_ADDRESS_SERVICE_INQUIRY = 'popup_service_inquiry';
const POPUP_ADDRESS_SERVICE_INQUIRY_HISTORY = 'popup_service_inquiry_history';
const POPUP_ADDRESS_SERVICE_INQUIRY_FAQ = 'popup_service_inquiry_faq';
const POPUP_ADDRESS_SERVICE_HELPER = 'popup_service_helper';

const POPUP_ADDRESS_MYPAGE = 'popup_mypage';
const POPUP_ADDRESS_MYPAGE_MODIFY = 'popup_mypage_modify';
const POPUP_ADDRESS_MYPAGE_PHOTO_UPDATE = 'popup_mypage_photo_update';
const POPUP_ADDRESS_PASSWORD_MODIFY = 'popup_password_modify';
// 풀페이지 팝업

// User Input 팝업
const POPUP_ADDRESS_OPTION_SELECTOR = 'popup_basic_option_selector';
const POPUP_ADDRESS_TIME_SELECTOR = 'popup_basic_time_selector';
const POPUP_ADDRESS_DATE_SELECTOR = 'popup_basic_date_selector';
const POPUP_ADDRESS_SPIN_SELECTOR = 'popup_basic_spin_selector';

const POPUP_ADDRESS_MEMBER_SELECT = 'popup_member_select';
const POPUP_ADDRESS_LECTURE_SELECT = 'popup_lecture_select';
const POPUP_ADDRESS_TICKET_SELECT = 'popup_ticket_select';
const POPUP_ADDRESS_COLOR_SELECT = 'popup_color_select';

const POPUP_ADDRESS_REPEAT_SELECT = 'popup_repeat_select';
const POPUP_ADDRESS_DAY_SELECT = 'popup_day_select';

const POPUP_ADDRESS_CATEGORY_SELECT = 'popup_category_select';
const POPUP_ADDRESS_CUSTOM_SELECT = 'popup_custom_select';
const POPUP_ADDRESS_PASSWORD_4D_INPUT = 'popup_password_4d_input';
const POPUP_ADDRESS_BOARD_WRITER = 'popup_board_writer';
const POPUP_ADDRESS_BOARD_READER = 'popup_board_reader';
const POPUP_ADDRESS_DRAWING_BOARD = 'popup_drawing_board';

const POPUP_ADDRESS_PTERS_PASS_MAIN = 'popup_pters_pass_main';
const POPUP_ADDRESS_PTERS_PASS_PAY_INFO = 'popup_pters_pass_pay_info';
const POPUP_ADDRESS_PTERS_PASS_SHOP = 'popup_pters_pass_shop';
const POPUP_ADDRESS_PTERS_PASS_SHOP_AGREEMENT = 'popup_pters_pass_shop_agreement';
const POPUP_ADDRESS_PTERS_PASS_PAY_CANCEL = 'popup_pters_pass_pay_cancel';
// User Input 팝업

// PassInspector
const BLOCKED = false;
const PASSED = true;

/* 팝업 주소 */

/* input팝업 구분 */
// const AJAX = 0;
// const LOCAL = 1;
/* input팝업 구분 */

/*기타 */
const DAYNAME_KR = ['일', '월', '화', '수', '목', '금', '토'];
const DAYNAME_MATCH = {"SUN":'일', "MON":'월', "TUE":'화', "WED":'수', "THS":'목', "FRI":'금', "SAT":'토'};
const DAYNAME_EN_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THS', 'FRI', 'SAT'];
const COLOR_NAME_CODE = {"#fbf3bd":"바나나", "#dbe6f7":"하늘", "#ffd3d9": "복숭아",
              "#ffe3c2":"살구", "#ceeac4":"키위", "#d8d6ff":"포도",
              "#ead8f2":"블루베리", "#d9c3ab":"고구마", "#ffacb7":"복숭아"};
const SEX_CODE = {"M": "남성", "W": "여성"};
const SCHEDULE_STATUS = {"NP" : "진행전", "PC": "결석", "PE": "출석"};
const TICKET_STATUS = {"IP": "진행중", "PE": "종료", "RF": "환불"};
const PAY_TYPE_NAME = {"SINGLE": "1회 결제", "PERIOD": "정기 결제 / 1 개월", "":"없음"};
const PAY_STATUS = {"paid":"결제 완료", "failed":"결제 실패", "cancelled":"결제 취소", "reserve":"결제 예정"};
const PAY_METHOD = {"card":"카드 결제", "iap": "인앱 결제", "":"-"};
const PAYMENT_ID = "imp53133818";
const PASS_PRODUCT = {"standard":{id:7, text:"스탠다드", price:9900}, "premium":{id:8, text:"프리미엄", price:15000}};

//  수업 종류 - 개인 레슨 자유형
const LECTURE_TYPE_ONE_TO_ONE = 'ONE_TO_ONE';
//  수업 종류 - 일반 수업
const LECTURE_TYPE_NORMAL = 'NORMAL';




//프로그램 리스트
const PROGRAM_CATEGORY = {
    TR:{name:"운동", 
        sub_category:{
            WT:{name:"웨이트 트레이닝"},
            PI:{name:"필라테스"},
            YG:{name:"요가"},
            BL:{name:"발레"},
            GOLF:{name:"골프"},
            TENNIS:{name:"테니스"},
            BILLIARD:{name:"당구"},
            SPINNING:{name:"스피닝"}
        }
    },
    MU:{name:"음악", 
        sub_category:{
            PIANO:{name:"피아노"},
            FLUTE:{name:"플룻"},
            VIOLIN:{name:"바이올린"},
            CELLO:{name:"첼로"},
            VOCAL_MUSIC:{name:"성악"},
            CLARINET:{name:"클라리넷"},
            GUITAR:{name:"기타"},
            DRUM:{name:"드럼"},
            VOCAL:{name:"보컬"},
            COMPOSITION:{name:"작곡"}
        }
    },
    PL:{name:"과외", 
        sub_category:{
            KO:{name:"국어"},
            EG:{name:"영어"},
            EG_CM:{name:"영어회화"},
            MA:{name:"수학"},
            CH:{name:"중국어"},
            CH_CM:{name:"중국어 회화"},
            JP:{name:"일본어"},
            JP_CM:{name:"일본어 회화"},
            SCIENCE:{name:"과학"}
        }
    },
    ETC:{name:"기타",
        sub_category:{
            ETC:{name:"기타"}
        }},
};



const TEXT = {
    //메뉴들
    menu:{KR:"전체", EN:"Menu", JP:""},
    home:{KR:"홈", EN:"Home", JP:""},
    schedule:{KR:"일정", EN:"Schedule", JP:""},
    member:{KR:"회원", EN:"Member", JP:""},
    lecture:{KR:"수업", EN:"Lecture", JP:""},
    ticket:{KR:"수강권", EN:"Ticket", JP:""},
    statistics:{KR:"통계", EN:"Statistics", JP:""},
    attend_check:{KR:"출석 체크", EN:"Attend check", JP:""},
    notification:{KR:"알림", EN:"Notification", JP:""},
    settings:{KR:"설정", EN:"Settings", JP:""},
    service:{KR:"서비스", EN:"Service", JP:""},
    work_time:{KR:"업무 시간", EN:"Working time", JP:""},
    auto_complete:{KR:"자동 완료", EN:"Auto Complete", JP:""},
    member_reserve:{KR:"회원 예약", EN:"Member Reserve", JP:""},
    attend_mode:{KR:"출석 체크 모드", EN:"Attend Mode", JP:""},
    notice:{KR:"공지 사항", EN:"Notice", JP:""},
    inquiry:{KR:"이용 문의", EN:"Inquiry", JP:""},
    help:{KR:"도움말", EN:"Help", JP:""},
    purchase_pters_pass:{KR:"PTERS패스 구매", EN:"Buy PTERS Pass", JP:""},

    //공통
    close:{KR:"닫기", EN:"Close", JP:""},
    done:{KR:"완료", EN:"Done", JP:""},
    save:{KR:"저장", EN:"Save", JP:""},
    registration:{KR:"등록", EN:"Add", JP:""},

    //홈
    change:{KR:"변경", EN:"Change", JP:""},
    today_plans:{KR:"오늘의 일정", EN:"Today's Plan", JP:""},
    hide_show:{KR:"접기/펼치기", EN:"Hide/Show", JP:""},
    expiration_alert:{KR:"종료 임박 회원", EN:"Contract Expiration", JP:""},
    sales_of_this_month:{KR:"이번달 매출", EN:"Sales of this month", JP:""},

    //일정
    monthly_calendar:{KR:"월간 달력", EN:"Monthly Calendar", JP:""},
    weekly_calendar:{KR:"주간 달력", EN:"Weekly Calendar", JP:""},
    repeat_schedule_list:{KR:"반복 일정 리스트", EN:"Repeat schedule list", JP:""},
    am:{KR:"오전", EN:"AM", JP:""},
    pm:{KR:"오후", EN:"PM", JP:""},

    new_schedule:{KR:"새로운 일정", EN:"New schedule", JP:""},
    date:{KR:"일자", EN:"Date", JP:""},
    time:{KR:"시간", EN:"Time", JP:""},
    repeat:{KR:"반복", EN:"Repeat", JP:""},
    memo:{KR:"메모", EN:"Memo", JP:""},
    


};


const payment_agreement = {
    caution:{
        KR:
            `<p>피터스의 모든 이용권은 국내에서만 구매 가능하며, 사용이 가능합니다.</p>
            <p>본 이용권 구매 시 부가세 10%가 포함되어 청구됩니다.</p>
            <p>구입하신 이용권은 마이페이지의 이용권 내역에서 확인 할 수 있습니다.</p>
            <p>단, 이용내역이 있는 경우 이용금액 공제, 이벤트등의 할인 혜택을 받으신 경우 해당금액 공제 후 환불 가능합니다.</p>
            <p>이용 금액은 결제일 이후 피터스에 접속한 기간에 상응하는 금액을 말합니다.</p>
            <p>미성년자가 법정대리인 동의 없이 계약을 체결한 경우, 미성년자 또는 법정 대리인이 이를 취소할 수 있습니다.</p>
            <p>이용권 구매내역을 타인에게 양도하거나 다른 아이디로 이전하는 기능은 제공하지 않습니다.</p>
            <p>이용권은 앱, PC, 모바일 웹에서 이용이 가능합니다.</p>
            <p>App Store 결제는 현재 사용하고 있는 App Store계정을 통해 결제됩니다.</p>
            <p>결제 금액에 대한 확인 및 환불은 Apple을 틍해 가능합니다. 결제내역 및 환불 관련 문의는 Apple 고객센터(080-333-4000)으로 부탁드립니다.</p>`
        ,
        EN:{

        },
        JP:{

        }
    },
    agreement:{
        KR:`
            <div>
                <p style="font-size:14px;">1. 총칙</p>

                <b> 제1조 (목적) </b><br/>
            &nbsp; 이 약관은 SPOONER(이하 ‘회사’라 합니다)이 제공하는 PTERS(피터스) 서비스(이하 “서비스”라 합니다.)와 관련하여 제반 서비스의 유료서비스를 이용함에 있어 회사와 회원간 제반 법률관계 및 기타 관련 사항을 규정함을 목적으로 합니다.<br/>
            <br/>
            </div>
            <div>
                <b> 제2조 (용어의 정의) </b><br/>
                ① 이 약관에서 사용되는 용어의 정의는 다음과 같습니다.<br/>
                1.‘회원가입’이라 함은 PTERS 서비스 또는 유료서비스를 이용하고자 하는 자(‘ 회원’이라고도 합니다)가 PTERS 이용약관에 동의하고 회사와 그 이용계약을 체결하는 것을 의미합니다. 회원가입을 하는 경우 고객은 “서비스” 회원이 됩니다.<br/>
                2.‘회원탈퇴’라 함은 회원이 서비스 이용약관 또는 유료서비스약관의 체결로 발생한 제반 권리와 의무 등의 법률관계를 자의로 영구히 종료하거나, 포기하는 것을 의미합니다.<br/>
                3.‘유료서비스’라 함은 회원이 회사에 일정 금액을 지불해야만 이용할 수 있는 회사의 서비스 또는 이용권(상품)을 의미하거나, 회사 또는 제3자와의 거래 내지 약정 조건을 수락하는 대가로 이용하게 되는 회사의 서비스 또는 이용권(상품)을 의미합니다.
                유료서비스의 세부내용은 각각의 서비스 또는 이용권(상품) 구매 페이지 및 해당 서비스 또는 이용권(상품)의 결제 페이지에 상세히 설명되어 있습니다.
                단순히 사이트에 연결(링크)된 유료 콘텐츠 제공업체 및 회사와 계약을 통하여 입점한 제휴서비스는 회사의 유료서비스 이용 행위로 보지 않으며, 본 약관을 적용하지 아니합니다.<br/>
                4.‘유료회원’이라 함은 별도의 금액을 지불하여 유료서비스를 구매한 회원 및 회사 또는 제3자가 정하는 이벤트, 마케팅에 참여하는 등의 방법으로 회사의 유료서비스를 이용하는 회원을 말합니다.<br/>
                5.‘무료회원’이라 함은 유료회원이 아닌 회원으로 회원가입 이후에 기본적으로 모든 회원에게 부여되는 자격을 가진 회원을 의미합니다.<br/>
                6.‘결제’라 함은 회원이 특정 유료서비스를 이용하기 위하여 각종 지불수단을 통하여 회사가 정한 일정 금액을 회사에 지불하는 것을 의미합니다.<br/>
                7.‘구매’라 함은 회사가 유료서비스에 대한 이용 승낙 및 유료서비스 제공이 가능할 수 있도록 회원이 이용하고자 하는 유료서비스를 선택하여 지불수단을 통한 결제로써 그 대가를 지급하는 행위를 의미합니다.<br/>
                <br/>
            </div>
            <div>
            <b> 제3조 (약관의 효력/변경 등)</b><br/>
                ① 이 약관은 유료서비스를 이용하기를 희망하는 회원이 동의함으로써 효력이 발생하며, 회원이 이 약관에 대하여 “동의하기” 버튼을 클릭한 경우, 이 약관의 내용을 충분히 이해하고 그 적용에 동의한 것으로 봅니다. <br/>
                ② 유료서비스 이용에 필요한 최소한의 기술사양은 아래 표와 같습니다. <br/>
                <table style="border:1px solid #444444;">
                    <tr style="border:1px solid #444444;">
                        <td style="border:1px solid #444444;">OS</td>
                        <td style="border:1px solid #444444;">CPU</td>
                        <td style="border:1px solid #444444;">RAM</td>
                        <td style="border:1px solid #444444;">브라우저</td>
                    </tr>
                    <tr style="border:1px solid #444444;">
                        <td style="border:1px solid #444444;">Window 7 이상 <br/> OS X 라이언 이상</td>
                        <td style="border:1px solid #444444;">Core2Duo P8700 이상</td>
                        <td style="border:1px solid #444444;">2G 이상</td>
                        <td style="border:1px solid #444444;">Chrome 67.0 이상 <br/> Safari 11 이상 <br/> MS Edge 42.0 이상 <br/> Firefox 61.0 이상</td>
                    </tr>
                    <tr style="border:1px solid #444444;">
                        <td colspan="4" style="border:1px solid #444444;">InternetExplorer의 경우 접속이 제한되니 유의하시기 바랍니다.</td>
                    </tr>
                </table>

                ③ 회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다. 회사가 약관을 개정하는 경우에는 적용일자 및 변경사유를 명시하여 그 적용일자 15일 전부터 홈페이지에 공지합니다.
                다만, 회원에게 불리한 약관의 변경의 경우에는 그 개정 내용을 고객이 알기 쉽게 표시하여 그 적용일자 30일 전부터 공지하며, 이메일 주소, 문자메시지 등으로 회원에게 개별 통지합니다.
                회원의 연락처 미기재, 변경 등으로 인하여 개별 통지가 어려운 경우, 회원이 등록한 연락처로 공지를 하였음에도 2회 이상 반송된 경우 이 약관에 의한 공지를 함으로써 개별 통지한 것으로 간주합니다. <br/>
                ④ 회사가 제3항의 공지 또는 통보를 하면서 개정 약관의 적용/시행일까지 회원이 거부 의사를 표시하지 아니할 경우 약관의 개정에 동의한 것으로 간주한다는 내용을 고지하였으나,
                회원이 명시적으로 약관 변경에 대한 거부의사를 표시하지 아니하면, 회사는 회원이 적용/시행일자 부로 변경 약관에 동의한 것으로 간주합니다.
                개정/변경 약관에 대하여 거부의사를 표시한 회원은 계약의 해지 또는 회원 탈퇴를 선택할 수 있습니다. <br/>
                ⑤ 회사는 이 약관을 회원이 그 전부를 인쇄할 수 있고 확인할 수 있도록 필요한 기술적 조치를 취합니다. <br/>
                ⑥ 이 약관은 회원이 이 약관에 동의한 날로부터 회원 탈퇴 시까지 적용하는 것을 원칙으로 합니다. 단, 이 약관의 일부 조항은 회원이 탈퇴 후에도 유효하게 적용될 수 있습니다. <br/>
                ⑦ 이 유료서비스약관의 제반 규정은, PTERS이용약관의 관련 규정에 우선 적용되며, 이용약관과 이 약관의 정의, 내용 등이 서로 상충되는 경우 이 약관의 관련 규정을 적용합니다.
                이 약관에 명시되지 아니한 사항에 대하여는 콘텐츠산업진흥법, 전자상거래 등에서의 소비자 보호에 관한 법률, 약관의 규제에 관한 법률 등 관련 법령에 따릅니다. <br/>
            <br/>
            </div>
            <div>
                <p style="font-size:14px;">2. 유료서비스 이용 계약</p>

            <b> 제4조 (유료서비스 이용계약의 성립 및 승낙의 제한) </b><br/>
                ① 유료서비스에 대한 이용계약은 이 약관에 동의한다는 의사표시(동의함을 선택)와 함께 이용 신청을 하고 회사가 이를 승낙함으로써 비로소 성립합니다.<br/>
                ② 회원은 유료서비스 이용계약을 체결하기 전에 해당 유료서비스에 대하여 이 약관에서 회사가 명시, 고지하는 사항을 숙지하고, 착오 없이 정확히 거래할 수 있도록 하여야 합니다. <br/>
                ③ 회사와 회원간 유료서비스 이용계약은 회사의 승낙이 회원에게 도달한 시점(유료서비스의 “구매/결제완료 등”의 표시가 회원에게 절차상 표시된 시점)에 성립합니다. <br/>
                ④ 회사는 서비스 이용약관 제7조 제2항(이용 계약의 성립)에서 정하는 사유가 발생하는 경우, 이용신청을 승낙하지 아니하거나 소정의 조건 성취 또는 제한 사유가 해소될 때까지 일정 기간 동안 승낙을 유보할 수 있습니다. <br/>
                ⑤ 회원은 유료서비스 이용 신청을 위한 제반 사항을 기재할 경우 회원의 현재의 사실과 일치하는 정보를 기재하여야 하며, 회원이 이용하고자 하는 유료서비스의 결제방법의 선택 및 선택한 결제방법에 필요한 결제정보를 정확히 회사에 제공하여야 하며,
                해당 사항이 변경될 경우 지체 없이 회사가 정한 절차에 따라 변경사항을 고지, 반영하여야 합니다. <br/>
                ⑥ 회사는 서비스 개인정보 처리 방침 제6조(처리하는 개인정보의 항목작성)의 기재사항 이외에 회원의 유료 서비스 이용에 필요한 최소한의 정보를 수집할 수 있습니다.
                이를 위해 회사가 문의한 사항에 대해 회원은 성실하게 고지합니다. 회사는 이 경우 수집하는 회원의 정보를 서비스 이용약관, 개인정보취급방침 및 정보통신망의 이용촉진 및 정보보호 등에 관한 법률이 정한 바에 따라 이용, 관리합니다. <br/>
            <br/>
            </div>
            <div>
            <b> 제5조 (결제수단 등)</b><br/>
             &nbsp; ① 회원이 유료서비스의 결제를 위하여 이용할 수 있는 지불수단은 다음 각 호와 같습니다. <br/>
                1.제휴된 신용카드 <br/>
                <!-- 2.제휴된 통신사 청구서 통합 결제 <br/> -->
                2.기타 회사가 제3자와 제휴계약 등을 체결하여 회원에게 결제 가능 여부 및 그 방법을 안내하게 되는 결제 수단에 의한 대금 지급 <br/>
                ② 회사는 유료서비스를 이용하는 회원의 거래금액에 대하여 내부정책 및 외부 결제업체(은행사, 카드사 등), 기타 관련 법령의 변경에 따라 회원 당 월 누적 결제액, 결제한도 등의 거래한도를 정할 수 있으며,
                회원은 회사가 정한 거래한도를 초과하는 범위의 유료서비스를 이용하고자 할 경우 거래한도의 초과로 인하여 유료서비스의 추가 이용이 불가능할 수 있습니다. <br/>
                ③ 제4항의 사정이 발생하게 될 경우, 회사는 회원이 결제시 해당 결제창에서 결제 가능 여부를 확인할 수 있도록 회원에게 안내합니다. <br/>
            <br/>
            </div>
            <div>
                <p style="font-size:14px;">3. 유료서비스 이용</p>

            <b> 제6조 (유료서비스와 유료회원)</b><br/>
                ① 회사가 회원의 이용신청을 승낙한 때(신규 및 일부 서비스의 경우, 이용 신청 접수 후 사전 공지한 지정된 일자)로부터 유료서비스는 개시되며,
                회사의 기술적 사유 등 기타 사정에 의하여 서비스를 개시할 수 없는 경우에는 제3조(약관의 효력/변경 등)의 방법에 따라 회원에게 사전 공지합니다. <br/>
                ② 회사는 회원의 이용신청이 있게 되는 경우, 그 사실을 통지하며, 회사의 통지를 받은 회원은 의사표시의 불일치 등이 있는 경우 불일치 사실을 정정 또는 수정을 요청하여야 하며, 회사는 회원의 요청에 따라 처리하여야 합니다.
                다만, 이미 대금을 지불한 경우에는 청약 철회 등에 관한 제17조(청약 철회 및 서비스 이용계약의 해제 • 해지)의 규정에 따릅니다. <br/>
                ③ 회사는 다음 각 호와 같은 유료서비스를 제공하며, 회사의 사정, 기타 제반 여건에 따라 서비스 내용을 추가하거나 변경할 수 있습니다.
                각 유료서비스의 내용은 이 약관 제7조(PTERS 부가서비스 이용권)에서 홈페이지 내 해당 유료서비스 구매페이지 등에서 회원에게 자세히 표시하고 있습니다. <br/>
                    1.이용권/서비스의 내용/속성에 따른 분류 <br/>
                        1) 광고 제거 기능 이용권 : PTERS 사용시 광고 제거 상태로 이용 가능 <br/>
                        2) 스탠다드 : 무료 이용자에게 적용되는 기능제한이 제거된 상태로 이용이 가능하며, 상세한 제한 해제 내역은 해당 유료서비스 구매페이지에 명시 <br/>
                        3) 비즈니스 : 사업자 전용 기능을 이용 가능<br/>
                    2.이용권/서비스의 이용기간/정기결제 여부에 따른 분류 <br/>
                        <!-- 1) 기간만료형 이용권 : 이용 가능 기간이 만료되는 경우, 유료서비스의 이용이 종료되는 서비스 <br/> -->
                        1) 정기결제형 이용권 : 회원이 등록한 결제수단을 통하여 월 단위로 이용요금이 자동으로 결제되고 이용기간이 자동 갱신되는 서비스 <br/>
                ④ 회사는 부가서비스 이용권외의 기타 콘텐츠나 부가서비스가 함께 제공되는 결합 서비스, 다른 회사와의 계약을 통한 제휴 서비스 등을 제공할 수 있습니다. <br/>
                ⑤ 회원이 이동전화단말기 제조사, 이동통신사와의 제휴 유료서비스에 가입한 경우, 이동통신요금제의 이용 정지/중단, 타요금제로의 변경,
                제휴사의 멤버십 종류 또는 단말기의 변경 등의 사유로 가입 당시 약정한 조건에 부합하지 않게 되는 경우에는 해당 제휴서비스가 제공하는 요금 감면,
                할인 등을 받을 수 없으므로 해당 조치 이전에 이용권/서비스 안내페이지 등 회사의 고지사항을 사전에 확인하여야 합니다. <br/>
                ⑥ 회원이 휴대폰, 무선 모뎀이 내장/장착된 PC 등에서 무선네트워크를 통하여 PTERS 사이트에 접속하거나 무선네트워크가 연결된 상태의 기기 내에 탑재된 PTERS 어플리케이션을 통하여 PTERS의 제반 서비스 및 이용권을 이용하는 경우,
                해외서비스 제공 가능시 해외에서 PTERS의 제반 서비스 및 이용권을 이용하게 되는 경우에는 회원과 회원이 가입한 해당 통신사간에 체결된 통신 요금제에 의한 별도의 데이터 통화료가 발생합니다.
                이 경우 발생하는 데이터 통화료는 회원과 해당 통신사간에 체결된 통신요금제에 따라 과금/청구/수납되므로, 데이터 통화료 분에 대해서는 회사는 어떠한 책임도 지지 않습니다. <br/>

            <br/>
            </div>
            <div>

                <b> 제7조 (PTERS 부가서비스 이용권) </b><br/>
                ① PTERS 부가서비스 이용권은 회원이 해당 이용권의 결제 완료시부터 약정 기간 동안 광고제거, 이용기능 제한 해제, 사업자용 추가기능 등을 이용할 수 있는 유료서비스입니다.<br/>
                ② 본 서비스는 월 정기결제형이 있습니다.<br/>
                ③ PTERS 부가서비스 이용권의 종류 및 결제수단, 이용기간, 이용가능 기기와 그 대수 등 조건에 대한 상세사항은 이용권(PTERS 패스) 구매 페이지, 결제 페이지 등에 게시, 안내합니다.<br/>
            <br/>
            </div>
            <div>
            <b> 제8조 (B2B 거래) </b><br/>
                ① B2B 거래란 특정 법인에게 PTERS 유료서비스를 대량으로 판매하는 거래를 말합니다. <br/>
                ② B2B 거래 시 거래량 및 해당 이용권의 용도에 따라 일정 수준의 할인율을 적용할 수 있습니다. <br/>

            <br/>
            </div>
            <div>
                <p style="font-size:14px;">4. 유료서비스의 변경, 청약 철회, 해지, 정지 및 중단</p>

            <b> 제9조 (회원의 유료서비스 예약 변경, 즉시 변경 등)</b><br/>
                ① 회원이 이미 구매/가입한 유료서비스는 원칙적으로 변경 처리가 되지 않고 해지 후 익월 다른 이용권으로 가입하도록 되어 있으나, 회사가 사전에 공지하고 정하는 일부 이용권에 한하여 회원이 변경 신청할 경우,
                1개월 후 예약 변경(이하 ‘예약 변경’) 또는 즉시 변경 처리(이하 ‘즉시 변경’)를 할 수 있습니다.<br/>
                ② 예약 변경의 경우, 회원이 변경 요청한 달의 이용기간이 만료되는 날까지 기존 구매/가입한 이용권을 이용할 수 있으며, 이용기간 만료일 익일부터 변경 요청한 이용권으로 변경 적용됩니다.<br/>
                ③ 즉시 변경의 경우, 회원이 즉시 변경 신청을 하면 회사가 접수 완료 후, 3일 내에 기존 구매/가입한 이용권의 이용이 중단되고, 신청한 이용권으로 변경 적용됩니다.<br/>
                ④ 모든 이용권의 ‘예약’ 변경의 경우 이용권의 ‘즉시’ 변경의 경우에는 이용권 변경 속성상 환불이 일체 이루어 지지 않습니다. 이용권의 ‘즉시’ 변경의 경우로서 다음과 같은 경우,
                회원의 즉시 변경 신청 적용일 현재 변경 전 이용권에 잔여 금액이 있을 경우, 차액 만큼 회원에게 이용 시간을 추가합니다.<br/>
                ⑤ 회사는 유료서비스 이용권에 대한 변경이 있게 될 경우, 이 약관 제3조(약관의 효력/변경 등)가 정하는 방법에 따라 그 사실 및 내용, 변경일자를 사전에 고지합니다.<br/>
            <br/>
            </div>
            <div>
            <b> 제10조 (청약 철회 및 서비스 이용계약의 해제 • 해지) </b><br/>
                ① 유료회원은 해당 유료서비스 내지 이용권을 전혀 사용하지 아니하였을 경우에 한하여 결제일로부터 7일 이내에 회사에 결제 취소(청약 철회)를 요청할 수 있습니다. 결제 취소(청약 철회)는 제6조(유료서비스와 유료회원) 제3항의 유료서비스 이용권에 한하여 가능합니다.
                단, 유료회원은 해당 유료서비스 내지 이용권의 내용이 표시•광고 내용과 다르거나 계약 내용과 다르게 이행된 경우에는 해당 콘텐츠를 공급받은 날로부터 3월 내지, 그 사실을 안 날 또는 알 수 있었던 날로부터 30일 이내에 청약철회 등을 할 수 있습니다. <br/>
                ② 유료회원이 제1항의 청약 철회가 가능한 유료서비스 또는 이용권에 대하여 청약 철회 가능한 기간(결제일로부터 7일 이내)을 경과하여 청약 철회를 신청하거나,
                전자상거래 등에서의 소비자 보호에 관한 법률, 콘텐츠산업진흥법, 콘텐츠이용자보호지침 등 기타 관계 법령에서 정한 청약 철회 제한 사유에 해당하는 콘텐츠의 경우에 해당하는 경우에는 청약 철회가 제한됩니다. <br/>
                ③ 청약 철회는 회원이 전화, 전자우편 등의 방법으로 할 수 있으며, 회사에 의사를 표시하여 회사에 도달될 때 그 효력이 발생하고, 회사는 회원의 의사표시를 수령한 후 지체 없이 이러한 사실을 회원에게 회신합니다. <br/>
                ④ 회사는 회원이 청약 철회, 해지/해제 신청을 확인 후 환불 금액이 있을 경우, 원칙적으로 회원의 해당 의사표시를 수령한 날로부터 3영업일 이내에 결제수단 별 사업자에게 대금의 청구 정지 내지 취소를 요청하고,
                회원이 결제한 동일 결제수단으로 환불함을 원칙으로 합니다. 단, 회사가 사전에 회원에게 공지한 경우 및 아래의 각 경우와 같이 개별 결제 수단별 환불 방법, 환불 가능 기간 등이 차이가 있을 수 있습니다. <br/>
                    1.신용카드 등 수납 확인이 필요한 결제수단의 경우에는 수납 확인일로부터 3영업일 이내 <br/>
                    2.결제수단 별 사업자가 회사와의 약정을 통하여 사전에 대금 청구 정지 내지 결제 취소 가능 기한 등을 미리 정하여 둔 경우로 해당 기한을 지난 환불의 경우 <br/>
                    3.회원이 유료서비스/ 이용권의 이용 결과, 얻은 이익이 있거나 중도 해지의 경우 <br/>
                    4.회원이 환불 처리에 필요한 정보 내지 자료를 회사에 즉시 제공하지 않는 경우 (현금 환불 시 신청인의 계좌 및 신분증 사본을 제출하지 아니하거나, 타인 명의의 계좌를 제공하는 경우 등) <br/>
                    5.해당 회원의 명시적 의사표시가 있는 경우 <br/>
                ⑤ 이 약관 제6조 제3항의 유료서비스 이용권을 구매한 회원이 해당 이용권을 중도 해지한 경우, 회사는 회원이 구매한 대금에서 회원이 실제 이용한 기간 등 서비스 또는 이용권을 통하여 취득한 이익을 감안,
                합리적인 범위 내에서 회사가 적용하는 소정의 기준율을 적용하여 차감하고 환불합니다. <br/>
                (이용권(PTERS 패스) 구매 후 이용계약 해지까지의 서비스 이용내역, 할인가격등을 기준으로 산출합니다.)
                ⑥ 회사는 콘텐츠이용자보호지침 등에 따라, 회사가 부담하였거나 부담할 부대비용, 수수료를 차감하여 환불할 수 있습니다. <br/>
                ⑦ 회원이 유료서비스 또는 이용권을 선물 받거나, 프로모션 등을 통해 무료/무상으로 취득하는 등 회원이 직접 비용을 지불하지 아니한 서비스에 대하여는 회사는 환불 의무를 부담하지 않습니다. <br/>
                ⑧ 회원이 이 약관에서 정하는 회원의 의무를 위반하였을 경우, 계약을 해제, 해지하거나 서비스 이용 제한, 손해배상 청구 등의 조치를 취할 수 있으며, 계약 해지 후 환불하여야 할 금액이 있을 경우에는 일정한 범위 내에서 회원이 부담할 금액을 공제하고 환불합니다. <br/>
                이 경우 회원은 해당 회사의 조치에 대하여 회사가 정한 절차에 따라 이의 신청을 할 수 있으며, 회사는 정당하다고 확인하는 경우 서비스 이용 재개 등을 할 수 있으며,
                이용자가 자신의 고의, 과실 없었음을 입증한 경우 회사는 서비스를 정지한 기간만큼 이용 기간을 연장합니다. <br/>
                ⑨ 회원의 신청 또는 동의에 따라 월 정기결제 중인 유료서비스의 경우, 해당 회원이 유료서비스의 이용요금을 체납하는 경우 연체가 발생한 날 자동으로 이용권 해지가 될 수 있으므로,
                월 정기결제를 통한 혜택을 유지하고자 하는 회원은 이용요금의 체납 또는 결제수단의 연체가 발생하지 않도록 사전에 조치하여야 합니다. <br/>
                ⑩ 월 정기결제 유료서비스를 이용 중인 회원이 탈퇴하는 경우 해당 이용권은 즉시 해지되며, 이 경우 회원의 정보와 일정 관리 내용 등 PTERS 서비스 이용내용은 관련 법령이 정하는 경우를 제외하고는 PTERS 이용약관 및 이 약관에 따릅니다. <br/>

            <br/>
            </div>
            <div>
                <b> 제11조 (과오금)</b><br/>
                ① 회사는 유료서비스 결제와 관련하여 과오금이 발생한 경우 이용대금의 결제와 동일한 방법으로 과오금 전액을 환불합니다. 다만, 동일한 방법으로 환불이 불가능할 때는 이를 사전에 고지합니다. <br/>
                ② 회사의 귀책사유로 과오금이 발생한 경우 과오금 전액을 환불합니다. 단, 회원의 귀책사유로 과오금이 발생한 경우, 회사가 과오금을 환불하는데 소요되는 비용은 합리적인 범위 내에서 이용자가 부담하여야 하며,
                회사는 해당 비용을 차감 후 과오금을 환불할 수 있습니다. <br/>
                ③ 회사는 회원이 요구하는 과오금에 대하여 환불을 거부할 경우, 정당하게 유료서비스 요금이 부과되었음을 입증할 책임을 부담합니다. <br/>
                ④ 회사는 과오금의 세부 환불절차 및 기타 사항에 대하여 다음과 같이 콘텐츠 이용자보호지침이 정하는 바에 따릅니다. <br/>
                    1.회사나 회원이 과오금의 발생사실을 안 때에는 전화, 전자우편 등 회사가 제시한 방법에 따라 상대방에게 통보 <br/>
                    2.회사는 회원에게 환불에 필요한 정보를 요청(회원 성명, 결제증빙서류, 전화번호, 환불 요청 계좌 등) <br/>
                    3.회원은 환불에 필요한 2.호의 정보를 회사에 제공 <br/>
                    4.회사는 이용자의 정보 제공일로부터 7일 이내 환불 처리 (회원의 명시적 의사표시가 있는 경우 차회 요금에서 상계 제공) <br/>
            <br/>
            </div>
            <div>
            <b> 제12조 (유료서비스의 정지, 중단) </b><br/>
                ① 회사는 원칙적으로 연중무휴 1일 24시간 유료서비스를 제공합니다. <br/>
                ② 회사는 이용자에 대한 서비스 개선을 목적으로 하는 설비 점검 및 보수 시에는 유료서비스의 전부 또는 일부의 제공을 제한, 중지, 중단할 수 있습니다. 이 경우 회사는 가능한 한 그 중단사유,
                중단 기간 등을 이 약관 제3조(약관의 효력/변경 등)의 방법을 통하여 사전에 회원에게 공지하며, 아래 각 호의 불가피한 경우에는 경위와 원인이 확인된 즉시 사후에 공지할 수 있습니다. <br/>
                    1.회원, 기타 불특정 제3자의 불법, 범죄행위로 인하여 기술적으로 정상적인 서비스의 제공이 어려운 경우 <br/>
                    2.시스템 또는 기타 서비스 설비의 장애, 유무선 Network 장애 또는 유료서비스 이용의 폭주 등으로 정상적인 유료서비스 제공이 불가능할 경우 <br/>
                    3.기타 천재지변, 국가비상사태, 정전 등 회사가 통제할 수 없는 불가항력적 사유로 인한 경우 <br/>
                ③ 회사는 제2항의 각 호에 해당하는 사유가 아닌 회사의 귀책사유로 서비스의 제공이 중단됨으로 인하여 회원이 입은 손해에 대하여 아래와 같이 콘텐츠 이용자보호지침에서 정하는 바에 따라 배상합니다.
                다만, 천재지변 등 불가항력으로 인한 경우는 아래 이용중지 또는 장애발생 시간에 산입하지 아니합니다. 또한, 각 호를 적용함에 있어 사전고지는 서비스 중지, 장애시점을 기준으로 24시간 이전에 고지된 것에 한합니다. <br/>
                    1.PTERS 부가서비스 이용권의 경우 사업자가 서비스의 중지•장애에 대하여 사전고지 하지 않은 경우에 있어서 이용자의 피해구제 등은 다음 각호에 의합니다.
                      다만, 이용자의 책임 있는 사유로 인하여 서비스가 중지되거나 장애가 발생한 경우 서비스 중지•장애시간에 포함하지 아니합니다. <br/>
                        1) 1개월 동안의 서비스 중지•장애발생 누적시간이 72시간을 초과한 경우 : 계약해제 또는 해지 및 미이용기간을 포함한 잔여기간에 대한 이용료 환급 및 손해배상
                          (단, 사업자가 고의 또는 과실 없음을 입증한 경우 손해배상책임을 지지 않음) <br/>
                        2) 사업자의 책임 있는 사유로 인한 서비스 중지 또는 장애의 경우 : 서비스 중지•장애시간의 2배를 무료로 연장 <br/>
                        3) 불가항력 또는 제3자의 불법행위 등으로 인해 서비스의 중지 또는 장애가 발생한 경우 : 계약을 해제할 수는 없지만,
                          서비스의 중지 또는 장애시간만큼 무료로 이용기간을 연장 사업자가 서비스의 중지•장애에 대하여 사전고지한 경우에 있어서 이용자의 피해구제 등은 다음 각호에 의합니다.
                          다만, 서비스 개선을 목적으로 한 설비 점검 및 보수시 1개월을 기준으로 최대 24시간은 중지•장애 시간에 포함하지 아니합니다. <br/>
                            가) 1개월을 기준으로 서비스 중지•장애시간이 10시간을 초과하는 경우 : 10시간과 이를 초과한 시간의 2배의 시간만큼 이용기간을 무료로 연장 <br/>
                            나) 1개월을 기준으로 서비스 중지•장애시간이 10시간을 초과하지 않은 경우 : 중지•장애 시간에 해당하는 시간을 무료로 연장 <br/>
                ④ 회사는 무료로 제공되는 서비스의 일부 또는 전부를 회사의 정책, 운영상의 긴요한 사유로 수정, 중단, 변경할 수 있으며, 이에 대하여 관련 법령에 별도 규정이 있지 아니하는 한 별도의 보상을 하지 않습니다. <br/>

            <br/>
            </div>
            <div>
                <p style="font-size:14px;">5. 계약당사자의 의무, 손해배상 등</p>
            <b> 제13조 (회원의 의무, 위반시 회사의 조치 등) </b><br/>
                ① 회원은 회사가 제공하는 유료서비스 이용 시 관계법령, 약관, 세부이용지침, 서비스 이용안내 및 사이트 내 공지한 주의사항, 회사가 서비스 이용과 관련하여 회원에게 통지하는 사항 등을 준수하여야 하며,
                기타 회사 및 타인의 명예를 훼손하거나 서비스 운영 기타 업무수행에 지장을 초래하는 행위를 해서는 안됩니다. 또한 과도한 서버 점유를 발생시키는 회원의 경우 이용에 제한이 있을 수 있습니다. <br/>
                ② 회원은 아이디 및 비밀번호를 관리할 책임이 있으며, 본인이 아닌 타인이 사용하게 하여서는 안됩니다. 이를 위반하여 회원의 개인정보를 타인이 사용하여 유료서비스를 이용함으로써 발생한 결과에 대한 책임은 회원에게 있습니다. <br/>
                회원은 타인의 명의, 아이디, 비밀번호, 휴대폰번호, 계좌번호, 신용카드번호 등 개인정보를 도용하거나 부정하게 사용하여서는 안됩니다. <br/>
                ③ 회원은 회사가 사전에 허용한 경우를 제외하고는 유료서비스를 영업활동 등 영리목적으로 이용하거나 이 약관에서 금지하는 행위를 하거나 허용하는 범위를 벗어난 이용행위를 하여서는 안됩니다. <br/>
                ④ 회원은 유료서비스 이용과정에서 위법행위 또는 선량한 풍속 기타 사회질서에 반하는 행위를 하여서는 안됩니다. <br/>
                ⑤ 회원은 유료서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 서비스의 이용 이외의 목적으로 사용하여서는 안됩니다. <br/>
                ⑥ 회사는 제1항부터 제5항까지 회원의 위반 행위가 있는 경우 해당 회원에 대하여 위반 사실을 고지하고 서비스 제공을 1개월간 정지시킬 수 있고, 동위반행위가 재발할 경우 서비스 이용계약을 해제 또는 해지할 수 있습니다. <br/>
                본항의 회사의 의사표시는 회원에게 도달한 날로부터 효력이 발생합니다. 회사의 해제/해지 및 이용 정지에 대하여 회원은 회사가 정한 절차에 따라 이의신청할 수 있습니다. 이 경우 이용자가 자신의 고의, 과실 없었음을 입증하거나 회원의 이의가 정당하다고 회사가 인정하는 경우 회사는 계정을 정지한 기간만큼 이용기간을 연장합니다.
                ⑦ 유료서비스 이용과 관련하여 진실한 정보를 입력하지 않은 회원은 법적인 보호를 받을 수 없으며, 서비스 이용에 제한을 받을 수 있습니다. <br/>
                ⑧ 민법에 의한 미성년회원이 유료서비스 내지 이용권을 이용하고자 하는 경우, 법정대리인(부모님)의 동의를 얻거나 계약 체결 후 추인을 얻지 않으면 미성년자 본인 또는 법정대리인이 그 계약을 취소할 수 있습니다. 
                만 14세 미만 아동이 서비스를 이용하기 위한 정보 제공 시에는 법정대리인의 동의를 받아야 합니다. <br/>

            <br/>
            </div>
            <div>
            <b> 제14조 (손해배상) </b><br/>
                ① 회사는 서비스의 결함에 의하여 회사가 제공하는 유료서비스의 내용인 콘텐츠가 손상, 훼손, 삭제되어 서비스 이용에 손해를 입은 회원에게 해당 콘텐츠의 복원 또는 서비스 이용기간 연장 등으로 배상합니다.
                회원에게 손해가 발생한 경우 회사는 회원에게 실제 발생한 손해만을 배상합니다. 다만, 회사의 고의 또는 과실 없이 회원에게 발생한 일체의 손해에 대하여는 책임을 지지 아니합니다.
                회사는 이 약관에서 명시되지 아니한 회사의 귀책사유로 인하여 유료서비스의 이용 회원에게 손해가 발생한 경우 회사의 배상 책임과 관련하여 회사는 '콘텐츠 이용자 보호지침'의 관련 규정 및 기타 상관례를 따릅니다. <br/>
                ② 회원이 이 약관상의 의무를 위반함으로 인하여 회사에 손해가 발생한 경우 또는 회원이 유료서비스를 이용함에 있어 회사에 손해를 입힌 경우, 회원은 회사에 그 손해를 배상하여야 합니다. <br/>

            <br/>
            </div>
            <div>
            <b> 제15조 (면책) </b><br/>
                ① 회사는 다음 각 호의 사유로 인하여 회원 또는 제3자에게 발생한 손해에 대하여는 그 책임을 지지 아니합니다. <br/>
                    1.천재지변 또는 이에 준하는 불가항력으로 인해 유료서비스를 제공할 수 없는 경우 <br/>
                    2.회원이 자신의 아이디 또는 비밀번호 등의 관리를 소홀히 한 경우 <br/>
                    3.회사의 관리영역이 아닌 공중통신선로의 장애로 서비스이용이 불가능한 경우 <br/>
                    4.기타 회사의 귀책사유가 없는 통신서비스 등의 장애로 인한 경우 <br/>
                ② 회사는 회원이 유료서비스를 이용하여 기대하는 수익을 얻지 못하거나 상실한 것, 서비스에 게시된 게시물에 대한 취사 선택 또는 이용으로 발생하는 손해 등에 대해서는 책임을 지지 않습니다.
                또한 회원이 사이트에 게재한 게시물의 정확성 등 내용에 대하여는 책임을 지지 않습니다. <br/>
                ③ 회사는 회원 상호간 또는 회원과 제3자 상호간에 유료서비스와 관련하여 발생한 분쟁에 대하여 개입할 의무가 없으며, 회사에 귀책사유가 없는 한 이로 인하여 발생한 손해를 배상할 책임이 없습니다. <br/>

            <br/>
            </div>
            <div>
            <b> 제16조 (분쟁의 해결) </b><br/>
                ① 유료서비스 이용과 관련하여 회사와 회원 사이에 분쟁이 발생한 경우, 회사와 회원은 분쟁의 해결을 위해 성실히 협의하고, 협의가 안될 경우 콘텐츠산업진흥법 상 콘텐츠분쟁 조정 위원회에 분쟁조정을 신청할 수 있습니다. <br/>
                ② 전항에 따라 분쟁이 해결되지 않을 경우 양 당사자는 소를 제기할 수 있으며, 회사와 회원 간의 소의 관할은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우 거소를 관할하는 지방법원의 전속 관할로 합니다. <br/>
                ③ 제소 당시 회원의 주소 또는 거소가 분명하지 않은 경우에는 민사소송법에 따라 관할법원을 정합니다. <br/>

            <br/>
            </div>
            <div>
            &nbsp; < 부칙 ><br/>
            &nbsp; 1. 이 약관은 2018년 10월 25일부터 시행됩니다.<br/>
            <br/>
            </div>
            `
        ,
        EN:null,
        JP:null
    }
}

;