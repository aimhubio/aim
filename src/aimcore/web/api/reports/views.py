from aimcore.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from aimcore.web.api.reports.serializers import report_response_serializer
from aimcore.web.api.reports.models import Report
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException


from aimcore.web.api.reports.pydantic_models import (
    ReportCreateIn, ReportUpdateIn, ReportOut, ReportListOut,
)
from aimcore.web.api.db import get_session

reports_router = APIRouter()


@reports_router.get('/', response_model=ReportListOut)
async def reports_list_api(session: Session = Depends(get_session)):
    reports_query = session.query(Report).order_by(Report.updated_at)
    result = [report_response_serializer(report) for report in reports_query]
    return result


@reports_router.post('/', status_code=201, response_model=ReportOut)
async def reports_post_api(request_data: ReportCreateIn, session: Session = Depends(get_session)):
    report = Report(request_data.code, request_data.name,
                    request_data.description)
    session.add(report)
    session.commit()
    return report_response_serializer(report)


@reports_router.get('/{report_id}/', response_model=ReportOut)
async def reports_get_api(report_id: str, session: Session = Depends(get_session)):
    report = session.query(Report).filter(Report.uuid == report_id).first()
    if not report:
        raise HTTPException(status_code=404)
    return report_response_serializer(report)


@reports_router.put('/{report_id}/', response_model=ReportOut)
async def reports_put_api(report_id: str, request_data: ReportUpdateIn,
                          session: Session = Depends(get_session)):
    report = session.query(Report).filter(Report.uuid == report_id).first()
    if not report:
        raise HTTPException(status_code=404)
    if request_data.code is not None:
        report.code = request_data.code
    if request_data.name is not None:
        report.name = request_data.name
    if request_data.description is not None:
        report.description = request_data.description
    session.commit()
    return report_response_serializer(report)


@reports_router.delete('/{report_id}/')
async def reports_delete_api(report_id: str, session: Session = Depends(get_session)):
    report = session.query(Report).filter(Report.uuid == report_id).first()
    if not report:
        raise HTTPException(status_code=404)
    session.delete(report)
    session.commit()
