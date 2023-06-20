from aimcore.web.api.reports.models import Report


def report_response_serializer(report_object):
    if not isinstance(report_object, Report):
        return None

    response = {
        'id': report_object.uuid,
        'code': report_object.code,
        'name': report_object.name,
        'description': report_object.description,
        'updated_at': report_object.updated_at,
        'created_at': report_object.created_at
    }

    return response
