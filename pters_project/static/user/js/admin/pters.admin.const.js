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
const NOTICE_TYPE = {NOTICE:"공지", FAQ:"FAQ", SYS_USAGE:"사용법"};
const NOTICE_USE = {1:{text:"공개", color:"green"}, 0:{text:"비공개", color:"#676767"} };
const NOTICE_TARGET = {ALL:"전체", trainer:"강사", trainee:"수강회원"};

/* 팝업 주소 */

// 풀페이지 팝업
const POPUP_ADDRESS_QNA_DETAIL = 'popup_qna_detail';
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
const PAY_STATUS = {"paid":"결제 완료", "failed":"결제 실패", "cancelled":"결제 취소"};
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



// 관리자

QA_STATUS = {"QA_COMPLETE":"완료", "QA_WAIT":"대기"};
