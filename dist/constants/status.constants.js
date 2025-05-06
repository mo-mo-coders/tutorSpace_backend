"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS = void 0;
exports.STATUS = {
    200: {
        message: "Operation successful!",
        status: 200,
        statusText: "OK",
    },
    201: {
        message: "Resource created successfully!",
        status: 201,
        statusText: "Created",
    },
    202: {
        message: "Request accepted!",
        status: 202,
        statusText: "Accepted",
    },
    203: {
        message: "Non-Authoritative Information!",
        status: 203,
        statusText: "Non-Authoritative Information",
    },
    204: {
        message: "No Content!",
        status: 204,
        statusText: "No Content",
    },
    205: {
        message: "Reset Content!",
        status: 205,
        statusText: "Reset Content",
    },
    206: {
        message: "Partial Content!",
        status: 206,
        statusText: "Partial Content",
    },
    207: {
        message: "Multi-Status!",
        status: 207,
        statusText: "Multi-Status",
    },
    208: {
        message: "Already Reported!",
        status: 208,
        statusText: "Already Reported",
    },
    226: {
        message: "IM Used!",
        status: 226,
        statusText: "IM Used",
    },
    300: {
        message: "Multiple Choices!",
        status: 300,
        statusText: "Multiple Choices",
    },
    301: {
        message: "Moved Permanently!",
        status: 301,
        statusText: "Moved Permanently",
    },
    302: {
        message: "Found!",
        status: 302,
        statusText: "Found",
    },
    303: {
        message: "See Other!",
        status: 303,
        statusText: "See Other",
    },
    304: {
        message: "Not Modified!",
        status: 304,
        statusText: "Not Modified",
    },
    305: {
        message: "Use Proxy!",
        status: 305,
        statusText: "Use Proxy",
    },
    306: {
        message: "Switch Proxy!",
        status: 306,
        statusText: "Switch Proxy",
    },
    307: {
        message: "Temporary Redirect!",
        status: 307,
        statusText: "Temporary Redirect",
    },
    308: {
        message: "Permanent Redirect!",
        status: 308,
        statusText: "Permanent Redirect",
    },
    400: {
        message: "The request is invalid!",
        status: 400,
        statusText: "Bad Request",
    },
    401: {
        message: "You are not authorized for this action!",
        status: 401,
        statusText: "Unauthorized Access",
    },
    402: {
        message: "Payment Required!",
        status: 402,
        statusText: "Payment Required",
    },
    403: {
        message: "You are forbidden from accessing this resource!",
        status: 403,
        statusText: "Forbidden",
    },
    404: {
        message: "The resource was not found!",
        status: 404,
        statusText: "Not Found",
    },
    405: {
        message: "Method Not Allowed!",
        status: 405,
        statusText: "Method Not Allowed",
    },
    406: {
        message: "Not Acceptable!",
        status: 406,
        statusText: "Not Acceptable",
    },
    407: {
        message: "Proxy Authentication Required!",
        status: 407,
        statusText: "Proxy Authentication Required",
    },
    408: {
        message: "Request Timeout!",
        status: 408,
        statusText: "Request Timeout",
    },
    409: {
        message: "Conflict!",
        status: 409,
        statusText: "Conflict",
    },
    410: {
        message: "Gone!",
        status: 410,
        statusText: "Gone",
    },
    411: {
        message: "Length Required!",
        status: 411,
        statusText: "Length Required",
    },
    412: {
        message: "Precondition Failed!",
        status: 412,
        statusText: "Precondition Failed",
    },
    413: {
        message: "Payload Too Large!",
        status: 413,
        statusText: "Payload Too Large",
    },
    414: {
        message: "URI Too Long!",
        status: 414,
        statusText: "URI Too Long",
    },
    415: {
        message: "Unsupported Media Type!",
        status: 415,
        statusText: "Unsupported Media Type",
    },
    416: {
        message: "Range Not Satisfiable!",
        status: 416,
        statusText: "Range Not Satisfiable",
    },
    417: {
        message: "Expectation Failed!",
        status: 417,
        statusText: "Expectation Failed",
    },
    418: {
        message: "I'm a teapot!",
        status: 418,
        statusText: "I'm a teapot",
    },
    421: {
        message: "Misdirected Request!",
        status: 421,
        statusText: "Misdirected Request",
    },
    422: {
        message: "The request body is invalid!",
        status: 422,
        statusText: "Unprocessable Entity",
    },
    423: {
        message: "Locked!",
        status: 423,
        statusText: "Locked",
    },
    424: {
        message: "Failed Dependency!",
        status: 424,
        statusText: "Failed Dependency",
    },
    425: {
        message: "Too Early!",
        status: 425,
        statusText: "Too Early",
    },
    426: {
        message: "Upgrade Required!",
        status: 426,
        statusText: "Upgrade Required",
    },
    428: {
        message: "Precondition Required!",
        status: 428,
        statusText: "Precondition Required",
    },
    429: {
        message: "Too Many Requests!",
        status: 429,
        statusText: "Too Many Requests",
    },
    431: {
        message: "Request Header Fields Too Large!",
        status: 431,
        statusText: "Request Header Fields Too Large",
    },
    451: {
        message: "Unavailable For Legal Reasons!",
        status: 451,
        statusText: "Unavailable For Legal Reasons",
    },
    500: {
        message: "Something went wrong!",
        status: 500,
        statusText: "Internal Server Error",
    },
    501: {
        message: "Not Implemented!",
        status: 501,
        statusText: "Not Implemented",
    },
    502: {
        message: "Bad Gateway!",
        status: 502,
        statusText: "Bad Gateway",
    },
    503: {
        message: "Service Unavailable!",
        status: 503,
        statusText: "Service Unavailable",
    },
    504: {
        message: "Gateway Timeout!",
        status: 504,
        statusText: "Gateway Timeout",
    },
    505: {
        message: "HTTP Version Not Supported!",
        status: 505,
        statusText: "HTTP Version Not Supported",
    },
    506: {
        message: "Variant Also Negotiates!",
        status: 506,
        statusText: "Variant Also Negotiates",
    },
    507: {
        message: "Insufficient Storage!",
        status: 507,
        statusText: "Insufficient Storage",
    },
    508: {
        message: "Loop Detected!",
        status: 508,
        statusText: "Loop Detected",
    },
    510: {
        message: "Not Extended!",
        status: 510,
        statusText: "Not Extended",
    },
    511: {
        message: "Network Authentication Required!",
        status: 511,
        statusText: "Network Authentication Required",
    },
};
