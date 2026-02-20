"use client";

import { MainContent } from "@/components/home/MainContent"
export default function Home() {
  return (
        <MainContent />
  )
}
// {
//   "services": [
//     "ApiService",
//     "AuthService",
//     "InventoryService",
//     "NotificationService",
//     "PaymentService"
//   ],
//   "total_services": 5,
//   "service_health": {
//     "ApiService": "unhealthy",
//     "AuthService": "warning",
//     "InventoryService": "healthy",
//     "NotificationService": "healthy",
//     "PaymentService": "healthy"
//   },
//   "severity_distribution": {
//     "ApiService": {
//       "Low": 1,
//       "High": 7,
//       "Medium": 4
//     },
//     "AuthService": {
//       "Low": 5,
//       "Medium": 7
//     },
//     "InventoryService": {
//       "Low": 6
//     },
//     "NotificationService": {
//       "Low": 19
//     },
//     "PaymentService": {
//       "Low": 19
//     }
//   },
//   "most_common_errors": {
//     "ApiService": "Unknown",
//     "AuthService": "Unknown",
//     "InventoryService": "Unknown",
//     "NotificationService": "Unknown",
//     "PaymentService": "Payment Error"
//   },
//   "recent_errors": {
//     "ApiService": [
//       {
//         "timestamp": "2025-10-20 20:36:31,620",
//         "service": "ApiService",
//         "error_type": "Network Error",
//         "severity_level": "High",
//         "line": "2025-10-20 20:36:31,620 [ERROR] [ApiService]: API POST /orders - Request 75872 failed with 503 Internal Server Error",
//         "line_number": 47
//       },
//       {
//         "timestamp": "2025-10-20 20:36:31,621",
//         "service": "ApiService",
//         "error_type": "Database Error",
//         "severity_level": "High",
//         "line": "2025-10-20 20:36:31,621 [ERROR] [ApiService]: Service Unavailable - Database connection timeout for request 75872",
//         "line_number": 48
//       },
//       {
//         "timestamp": "2025-10-20 20:36:31,622",
//         "service": "ApiService",
//         "error_type": "Database Error",
//         "severity_level": "Medium",
//         "line": "2025-10-20 20:36:31,622 [WARNING] [ApiService]: Database connection pool exhausted during request 75872",
//         "line_number": 49
//       },
//       {
//         "timestamp": "2025-10-20 20:36:34,607",
//         "service": "ApiService",
//         "error_type": "Unknown",
//         "severity_level": "High",
//         "line": "2025-10-20 20:36:34,607 [WARNING] [ApiService]: API POST /products - Request 62415 failed with 404",
//         "line_number": 57
//       },
//       {
//         "timestamp": "2025-10-20 20:36:34,607",
//         "service": "ApiService",
//         "error_type": "Unknown",
//         "severity_level": "Medium",
//         "line": "2025-10-20 20:36:34,607 [WARNING] [ApiService]: Resource not found: /products for request 62415",
//         "line_number": 58
//       }
//     ],
//     "AuthService": [
//       {
//         "timestamp": "2025-10-20 20:36:33,135",
//         "service": "AuthService",
//         "error_type": "Unknown",
//         "severity_level": "Medium",
//         "line": "2025-10-20 20:36:33,135 [WARNING] [AuthService]: Suspicious activity for user user_718 (IP mismatch)",
//         "line_number": 50
//       },
//       {
//         "timestamp": "2025-10-20 20:36:33,136",
//         "service": "AuthService",
//         "error_type": "Unknown",
//         "severity_level": "Medium",
//         "line": "2025-10-20 20:36:33,136 [WARNING] [AuthService]: Location change detected for user user_718: New York -> London",
//         "line_number": 51
//       },
//       {
//         "timestamp": "2025-10-20 20:36:33,136",
//         "service": "AuthService",
//         "error_type": "Unknown",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:33,136 [ERROR] [AuthService]: Potential account breach attempt for user user_718",
//         "line_number": 52
//       },
//       {
//         "timestamp": "2025-10-20 20:36:37,103",
//         "service": "AuthService",
//         "error_type": "Network Error",
//         "severity_level": "Medium",
//         "line": "2025-10-20 20:36:37,103 [ERROR] [AuthService]: Auth server timeout while validating user user_176",
//         "line_number": 63
//       },
//       {
//         "timestamp": "2025-10-20 20:36:37,104",
//         "service": "AuthService",
//         "error_type": "Unknown",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:37,104 [ERROR] [AuthService]: LDAP connection failure during authentication for user user_176",
//         "line_number": 64
//       }
//     ],
//     "InventoryService": [
//       {
//         "timestamp": "2025-10-20 20:36:21,366",
//         "service": "InventoryService",
//         "error_type": "Unknown",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:21,366 [INFO] [InventoryService]: Inventory transfer: 16 units of Mouse from SEA-5 to ATL-4",
//         "line_number": 10
//       },
//       {
//         "timestamp": "2025-10-20 20:36:24,814",
//         "service": "InventoryService",
//         "error_type": "Unknown",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:24,814 [INFO] [InventoryService]: Stock added: 13 units of Docking Station (SKU: DS-8910) to NYC-1",
//         "line_number": 21
//       },
//       {
//         "timestamp": "2025-10-20 20:36:29,590",
//         "service": "InventoryService",
//         "error_type": "Unknown",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:29,590 [INFO] [InventoryService]: Inventory transfer: 2 units of Headphones from NYC-1 to ATL-4",
//         "line_number": 39
//       },
//       {
//         "timestamp": "2025-10-20 20:36:33,277",
//         "service": "InventoryService",
//         "error_type": "Unknown",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:33,277 [INFO] [InventoryService]: Inventory transfer: 16 units of Phone from CHI-3 to SEA-5",
//         "line_number": 53
//       },
//       {
//         "timestamp": "2025-10-20 20:36:37,040",
//         "service": "InventoryService",
//         "error_type": "Unknown",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:37,040 [INFO] [InventoryService]: Inventory transfer: 9 units of Laptop from SEA-5 to ATL-4",
//         "line_number": 62
//       }
//     ],
//     "NotificationService": [
//       {
//         "timestamp": "2025-10-20 20:36:31,513",
//         "service": "NotificationService",
//         "error_type": "Unknown",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:31,513 [INFO] [NotificationService]: Push notification clicked by user 8758",
//         "line_number": 46
//       },
//       {
//         "timestamp": "2025-10-20 20:36:35,584",
//         "service": "NotificationService",
//         "error_type": "Unknown",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:35,584 [INFO] [NotificationService]: Preparing sms notification NOTIF-19332 for user 6059",
//         "line_number": 59
//       },
//       {
//         "timestamp": "2025-10-20 20:36:35,584",
//         "service": "NotificationService",
//         "error_type": "Unknown",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:35,584 [INFO] [NotificationService]: Sending sms notification for event: security alert",
//         "line_number": 60
//       },
//       {
//         "timestamp": "2025-10-20 20:36:35,585",
//         "service": "NotificationService",
//         "error_type": "Unknown",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:35,585 [INFO] [NotificationService]: SMS notification NOTIF-19332 sent to user 6059",
//         "line_number": 61
//       },
//       {
//         "timestamp": "2025-10-20 20:36:37,794",
//         "service": "NotificationService",
//         "error_type": "Communication Error",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:37,794 [INFO] [NotificationService]: Preparing email notification NOTIF-62582 for user 2705",
//         "line_number": 68
//       }
//     ],
//     "PaymentService": [
//       {
//         "timestamp": "2025-10-20 20:36:34,560",
//         "service": "PaymentService",
//         "error_type": "None",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:34,560 [INFO] [PaymentService]: Payment TXN-352937 successfully processed for user 4068",
//         "line_number": 55
//       },
//       {
//         "timestamp": "2025-10-20 20:36:34,560",
//         "service": "PaymentService",
//         "error_type": "Payment Error",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:34,560 [INFO] [PaymentService]: Receipt generated for transaction TXN-352937",
//         "line_number": 56
//       },
//       {
//         "timestamp": "2025-10-20 20:36:37,384",
//         "service": "PaymentService",
//         "error_type": "Payment Error",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:37,384 [INFO] [PaymentService]: Payment initiated: TXN-709675 for order ORD-83120 - AUD 386.83",
//         "line_number": 65
//       },
//       {
//         "timestamp": "2025-10-20 20:36:37,385",
//         "service": "PaymentService",
//         "error_type": "None",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:37,385 [INFO] [PaymentService]: Payment TXN-709675 successfully processed for user 4718",
//         "line_number": 66
//       },
//       {
//         "timestamp": "2025-10-20 20:36:37,385",
//         "service": "PaymentService",
//         "error_type": "Payment Error",
//         "severity_level": "Low",
//         "line": "2025-10-20 20:36:37,385 [INFO] [PaymentService]: Receipt generated for transaction TXN-709675",
//         "line_number": 67
//       }
//     ]
//   },
//   "first_error_timestamp": {
//     "ApiService": "2025-10-20 20:36:21,363",
//     "AuthService": "2025-10-20 20:36:21,363",
//     "InventoryService": "2025-10-20 20:36:21,364",
//     "NotificationService": "2025-10-20 20:36:21,364",
//     "PaymentService": "2025-10-20 20:36:21,364"
//   },
//   "latest_error_timestamp": {
//     "ApiService": "2025-10-20 20:36:34,607",
//     "AuthService": "2025-10-20 20:36:37,104",
//     "InventoryService": "2025-10-20 20:36:37,040",
//     "NotificationService": "2025-10-20 20:36:37,794",
//     "PaymentService": "2025-10-20 20:36:37,385"
//   },
//   "error_types": {
//     "ApiService": [
//       "Network Error",
//       "Unknown",
//       "Database Error"
//     ],
//     "AuthService": [
//       "Network Error",
//       "Unknown"
//     ],
//     "InventoryService": [
//       "Unknown"
//     ],
//     "NotificationService": [
//       "Unknown",
//       "Communication Error"
//     ],
//     "PaymentService": [
//       "None",
//       "Payment Error"
//     ]
//   },
//   "errors_per_10_logs": [
//     2.6,
//     0,
//     1.6,
//     1.6,
//     2.6,
//     1.6,
//     0.3
//   ],
//   "avg_errors_per_10_logs": 1.6666666666666667
// }