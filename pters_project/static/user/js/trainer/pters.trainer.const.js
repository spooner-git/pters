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

const CONNECTED = 0;
const UNCONNECTED = 1;
const CONNECT_WAIT = 2;

const PROGRAM_SELECT = 0;
const PROGRAM_LECTURE_CONNECT_ACCEPT = 1;
const PROGRAM_LECTURE_CONNECT_DELETE = 2;

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

const POPUP_ADDRESS_TICKET_VIEW = 'popup_ticket_view';
const POPUP_ADDRESS_TICKET_SIMPLE_VIEW = 'popup_ticket_simple_view';
const POPUP_ADDRESS_TICKET_ADD = 'popup_ticket_add';
const POPUP_ADDRESS_TICKET_EDIT = 'popup_ticket_edit';

const POPUP_MEMBER_SCHEDULE_HISTORY = 'popup_member_schedule_history';
const POPUP_MEMBER_TICKET_HISTORY = 'popup_member_ticket_history';

const POPUP_ADDRESS_MEMBER_ATTEND = 'popup_member_attend';
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
              "#ead8f2":"블루베리", "#d9c3ab":"고구마"};
const SEX_CODE = {"M": "남성", "W": "여성"};
const SCHEDULE_STATUS = {"NP" : "진행전", "PC": "결석", "PE": "출석완료"};
const TICKET_STATUS = {"IP": "진행중", "PE": "종료", "RF": "환불"};
