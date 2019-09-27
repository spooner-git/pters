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


/* px */
const MAX_WIDTH = 800;

/**/


/* 팝업 주소 */

// 풀페이지 팝업
const POPUP_ADDRESS_PLAN_VIEW = 'popup_plan_view';
const POPUP_ADDRESS_PLAN_ADD = 'popup_plan_add';

const POPUP_ADDRESS_MEMBER_VIEW = 'popup_member_view';
const POPUP_ADDRESS_MEMBER_SIMPLE_VIEW = 'popup_member_simple_view';
const POPUP_ADDRESS_MEMBER_ADD = 'popup_member_add';
const POPUP_ADDRESS_MEMBER_EDIT = 'popup_member_edit';

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

const POPUP_ADDRESS_PTERS_PASS_MAIN = 'popup_pters_pass_main';
const POPUP_ADDRESS_PTERS_PASS_PAY_INFO = 'popup_pters_pass_pay_info';
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
    work_time:{KR:"업무 시간", EN:"Working time", JP:""},
    auto_complete:{KR:"자동 완료", EN:"Auto Complete", JP:""},
    reserve:{KR:"예약", EN:"Reserve", JP:""},
    attend_mode:{KR:"출석 체크 모드", EN:"Attend Mode", JP:""},
    notice:{KR:"공지 사항", EN:"Notice", JP:""},
    inquiry:{KR:"이용 문의", EN:"Q & A", JP:""},
    help:{KR:"도움말", EN:"Help", JP:""}
};

