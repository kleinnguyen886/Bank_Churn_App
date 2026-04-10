from flask import Blueprint, render_template

from app.services.customer_service import get_customer_context


customer_bp = Blueprint("customer", __name__)


@customer_bp.route("/customer/<customer_id>")
def customer_detail(customer_id: str):
    return render_template(
        "customer/customer_detail.html",
        context=get_customer_context(customer_id),
    )
