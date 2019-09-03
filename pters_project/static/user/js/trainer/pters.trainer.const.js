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

const PROGRAM_SELECT = 0;
const PROGRAM_LECTURE_CONNECT_ACCEPT = 1;
const PROGRAM_LECTURE_CONNECT_DELETE = 2;

const PROGRAM_SELECTED = 'SELECTED';
const PROGRAM_NOT_SELECTED = 'NOT SELECTED';

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

const POPUP_ADDRESS_MEMBER_ATTEND = 'popup_member_attend';

const POPUP_ADDRESS_PROGRAM_LIST = 'popup_program_list';
const POPUP_ADDRESS_PROGRAM_ADD = 'popup_program_add';
const POPUP_ADDRESS_PROGRAM_VIEW = 'popup_program_view';

const POPUP_ADDRESS_SETTING_WORKTIME = 'popup_setting_worktime';
const POPUP_ADDRESS_SETTING_AUTOCOMPLETE = 'popup_setting_autocomplete';
const POPUP_ADDRESS_SETTING_RESERVE = 'popup_setting_reserve';
const POPUP_ADDRESS_SETTING_ALARM = 'popup_setting_alarm';
const POPUP_ADDRESS_SETTING_ATTENDMODE = 'popup_setting_attendmode';
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
// User Input 팝업

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
