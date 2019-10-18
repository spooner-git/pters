"""pters URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
    # 공지사항/사용법/FAQ 전체 조회
    url(r'^get_notice_all/$', views.GetNoticeAllView.as_view(), name='get_notice_all'),

    # 공지사항/사용법/FAQ 추가
    url(r'^add_notice_info/$', views.AddNoticeInfoView.as_view(), name='add_notice_info'),
    # 공지사항/사용법/FAQ 수정
    url(r'^update_notice_info/$', views.UpdateNoticeInfoView.as_view(), name='update_notice_info'),
    # 공지사항/사용법/FAQ 삭제
    url(r'^delete_notice_info/$', views.DeleteNoticeInfoView.as_view(), name='delete_notice_info'),


    # qa 전체 리스트 조회
    url(r'^get_qa_all/$', views.GetQaAllView.as_view(), name='get_qa_all'),
    # qa 상태 변경
    url(r'^update_qa_status_info/$', views.UpdateQaStatusInfoView.as_view(), name='update_qa_status_info'),


    # qa 답변 추가 + 상태 변경
    url(r'^add_qa_comment_info/$', views.AddQACommentInfoView.as_view(), name='add_qa_comment_info'),
    # qa 답변 수정 + 상태 변경
    url(r'^update_qa_comment_info/$', views.UpdateQACommentInfoView.as_view(), name='update_qa_comment_info'),
    # qa 답변 조회 -> board get_qa_comment_list 참고


    url(r'^update_admin_board_content_img/$', views.update_admin_board_content_img_logic,
        name='update_admin_board_content_img'),
    url(r'^delete_admin_board_content_img/$', views.delete_admin_board_content_img_logic,
        name='delete_admin_board_content_img'),

]
