export const bobot_emp = {
    "tipe_kendaraan":[
        "SM",
        "MP",
        "KS",
        "BB",
        "TB"
    ],
    "jenis_jalan":[
        "bebas_hambatan",
        "luar_kota",
        "perkotaan",
        "simpang_apill",
        "simpang_tanpa_apill"
    ],
    "emp":{
        "bebas_hambatan":{
            "JBH4/2":{
                "datar":{
                    "<1250":{
                        "ks":1.2,
                        "bb":1.2,
                        "tb":1.6
                    },
                    "1251-2250":{
                        "ks":1.4,
                        "bb":1.4,
                        "tb":2.0
                    },
                    "2251-2800":{
                        "ks":1.6,
                        "bb":1.7,
                        "tb":2.5
                    },
                    ">2800":{
                        "ks":2.0,
                        "bb":1.6,
                        "tb":3.5
                    }
                },
                "bukit":{
                    "<900":{
                        "ks":1.8,
                        "bb":1.6,
                        "tb":4.8
                    },
                    "901-1700":{
                        "ks":2.0,
                        "bb":2.0,
                        "tb":4.9
                    },
                    "1701-2250":{
                        "ks":2.2,
                        "bb":2.3,
                        "tb":4.5
                    },
                    ">2250":{
                        "ks":2.1,
                        "bb":2.1,
                        "tb":4.2
                    }
                },
                "gunung":{
                    "<700":{
                        "ks":3.0,
                        "bb":2.2,
                        "tb":5.0
                    },
                    "701-1450":{
                        "ks":2.9,
                        "bb":2.6,
                        "tb":5.1
                    },
                    "1451-2250":{
                        "ks":2.6,
                        "bb":2.9,
                        "tb":4.8
                    },
                    ">2250":{
                        "ks":2.2,
                        "bb":2.4,
                        "tb":4.5
                    }
                }
            },
            "JBH6/2":{
                "datar":{
                    "<1500":{
                        "ks":1.2,
                        "bb":1.2,
                        "tb":1.6
                    },
                    "1501-2750":{
                        "ks":1.4,
                        "bb":1.4,
                        "tb":2.0
                    },
                    "2751-3250":{
                        "ks":1.6,
                        "bb":1.7,
                        "tb":2.4
                    },
                    ">3250":{
                        "ks":2.0,
                        "bb":1.6,
                        "tb":3.3
                    }
                },
                "bukit":{
                    "<1100":{
                        "ks":1.8,
                        "bb":1.6,
                        "tb":4.8
                    },
                    "1101-2100":{
                        "ks":2.0,
                        "bb":2.0,
                        "tb":4.9
                    },
                    "2101-2650":{
                        "ks":2.2,
                        "bb":2.3,
                        "tb":4.4
                    },
                    ">2650":{
                        "ks":2.1,
                        "bb":2.1,
                        "tb":4.0
                    }
                },
                "gunung":{
                    "<800":{
                        "ks":3.0,
                        "bb":2.2,
                        "tb":5.0
                    },
                    "801-1700":{
                        "ks":2.9,
                        "bb":2.6,
                        "tb":5.1
                    },
                    "1701-2300":{
                        "ks":2.6,
                        "bb":2.9,
                        "tb":4.7
                    },
                    ">2300":{
                        "ks":2.2,
                        "bb":2.4,
                        "tb":4.3
                    }
                }
            }
        },
        "luar_kota":{
            "2/2-TT":{
                "datar":{
                    "<799":{
                        "ks":1.2,
                        "bb":1.2,
                        "tb":1.8,
                        "sm":{
                            "<6":0.8,
                            "6-8":0.6,
                            ">8":0.4
                        }
                    },
                    "800-1349":{
                        "ks":1.8,
                        "bb":1.8,
                        "tb":2.7,
                        "sm":{
                            "<6":1.2,
                            "6-8":0.9,
                            ">8":0.6
                        }
                    },
                    "1350-1899":{
                        "ks":1.5,
                        "bb":1.6,
                        "tb":2.5,
                        "sm":{
                            "<6":0.9,
                            "6-8":0.7,
                            ">8":0.5
                        }
                    },
                    ">1900":{
                        "ks":1.3,
                        "bb":1.5,
                        "tb":2.5,
                        "sm":{
                            "<6":0.6,
                            "6-8":0.5,
                            ">8":0.4
                        }
                    }
                },
                "bukit":{
                    "<649":{
                        "ks":1.8,
                        "bb":1.6,
                        "tb":5.2,
                        "sm":{
                            "<6":0.7,
                            "6-8":0.5,
                            ">8":0.3
                        }
                    },
                    "650-1099":{
                        "ks":2.4,
                        "bb":2.5,
                        "tb":5.0,
                        "sm":{
                            "<6":1.0,
                            "6-8":0.8,
                            ">8":0.5
                        }
                    },
                    "1100-1599":{
                        "ks":2.0,
                        "bb":2.0,
                        "tb":4.0,
                        "sm":{
                            "<6":0.8,
                            "6-8":0.6,
                            ">8":0.4
                        }
                    },
                    ">1600":{
                        "ks":1.7,
                        "bb":1.7,
                        "tb":3.2,
                        "sm":{
                            "<6":0.5,
                            "6-8":0.4,
                            ">8":0.3
                        }
                    }
                },
                "gunung":{
                    "<449":{
                        "ks":3.5,
                        "bb":2.5,
                        "tb":6.0,
                        "sm":{
                            "<6":0.6,
                            "6-8":0.4,
                            ">8":0.2
                        }
                    },
                    "450-899":{
                        "ks":3.0,
                        "bb":3.2,
                        "tb":5.5,
                        "sm":{
                            "<6":0.9,
                            "6-8":0.7,
                            ">8":0.4
                        }
                    },
                    "900-1349":{
                        "ks":2.5,
                        "bb":2.5,
                        "tb":5.0,
                        "sm":{
                            "<6":0.7,
                            "6-8":0.5,
                            ">8":0.3
                        }
                    },
                    ">1350":{
                        "ks":1.9,
                        "bb":2.2,
                        "tb":4.0,
                        "sm":{
                            "<6":0.5,
                            "6-8":0.4,
                            ">8":0.3
                        }
                    }
                }
            },
            "4/2-T":{
                "datar":{
                    "<999":{
                        "ks":1.2,
                        "bb":1.2,
                        "tb":1.6,
                        "sm":0.5
                    },
                    "1000-1799":{
                        "ks":1.4,
                        "bb":1.4,
                        "tb":2.0,
                        "sm":0.6
                    },
                    "1800-2149":{
                        "ks":1.6,
                        "bb":1.7,
                        "tb":2.5,
                        "sm":0.8
                    },
                    ">2150":{
                        "ks":1.3,
                        "bb":1.5,
                        "tb":2.0,
                        "sm":0.5
                    }
                },
                "bukit":{
                    "<749":{
                        "ks":1.8,
                        "bb":1.6,
                        "tb":4.8,
                        "sm":0.4
                    },
                    "750-1399":{
                        "ks":2.0,
                        "bb":2.0,
                        "tb":4.6,
                        "sm":0.5
                    },
                    "1400-1749":{
                        "ks":2.2,
                        "bb":2.3,
                        "tb":4.3,
                        "sm":0.7
                    },
                    ">1750":{
                        "ks":1.8,
                        "bb":1.9,
                        "tb":3.5,
                        "sm":0.4
                    }
                },
                "gunung":{
                    "<549":{
                        "ks":3.2,
                        "bb":2.2,
                        "tb":5.5,
                        "sm":0.3
                    },
                    "550-1099":{
                        "ks":2.9,
                        "bb":2.6,
                        "tb":5.1,
                        "sm":0.4
                    },
                    "1100-1499":{
                        "ks":2.6,
                        "bb":2.9,
                        "tb":4.8,
                        "sm":0.6
                    },
                    ">1500":{
                        "ks":2.0,
                        "bb":2.4,
                        "tb":3.8,
                        "sm":0.3
                    }
                }
            }
        },
        "perkotaan":{
            "_":{
                "2/2-TT":{
                    "<1800":{
                        "ks":1.3,
                        "sm":{
                            "<=6":0.5,
                            ">6":0.4
                        }
                    },
                    ">=1800":{
                        "ks":1.2,
                        "sm":{
                            "<=6":0.35,
                            ">6":0.25
                        }
                    }
                },
                "4/2-T":{
                    "<1050":{
                        "ks":1.3,
                        "sm":0.4
                    },
                    ">=1050":{
                        "ks":1.2,
                        "sm":0.25
                    }
                },
                "2/1":{
                    "<1050":{
                        "ks":1.3,
                        "sm":0.4
                    },
                    ">=1050":{
                        "ks":1.2,
                        "sm":0.25
                    }
                },
                "6/2-T":{
                    "<1100":{
                        "ks":1.3,
                        "sm":0.4
                    },
                    ">=1100":{
                        "ks":1.2,
                        "sm":0.25
                    }
                },
                "8/2-T":{
                    "<1100":{
                        "ks":1.3,
                        "sm":0.4
                    },
                    ">=1100":{
                        "ks":1.2,
                        "sm":0.25
                    }
                },
                "3/1":{
                    "<1100":{
                        "ks":1.3,
                        "sm":0.4
                    },
                    ">=1100":{
                        "ks":1.2,
                        "sm":0.25
                    }
                },
                "4/1":{
                    "<1100":{
                        "ks":1.3,
                        "sm":0.4
                    },
                    ">=1100":{
                        "ks":1.2,
                        "sm":0.25
                    }
                }
            }
        },
        "simpang_apill":{
            "terlindung":{
                "mp":1.0,
                "ks":1.3,
                "sm":0.15
            },
            "terlawan":{
                "mp":1.0,
                "ks":1.3,
                "sm":0.4
            }
        },
        "simpang_tanpa_apill":{
            "q_total>=1000":{
                "mp":1.0,
                "ks":1.8,
                "sm":0.2
            },
            "q_total<1000":{
                "mp":1.0,
                "ks":1.3,
                "sm":0.5
            }
        }
    }
}

export function hitung_smp(data={jumlah:{sm:0.0,mp:0.0,ks:0.0,bb:0.0,tb:0.0},jenis_jalan:'perkotaan'}) {
    // ambil dari emp.json
    fetch('emp.json')
    .then(response => response.json())
    .then(empData => {
        console.log(empData)
        console.log(empData.emp[data.jenis_jalan]);
        // Perform calculations using data from empData and jumlah object
        // For example:
        // const sm = jumlah.sm;
        // const mp = jumlah.mp;
        // const ks = jumlah.ks;
        // const bb = jumlah.bb;
        // const tb = jumlah.tb;

        // Perform calculations using empData and jumlah if needed

        // Return the result
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    })
}

export function hitung_smp_perkotaan(sm=0.0,mp=0.0,ks=0.0,bb=0.0,tb=0.0,tipe_jalan='2/2-tt',c_0=1800) {

    let hasil_smp = 0.0

    const jenis_jalan = 'perkotaan'
    tipe_jalan = tipe_jalan.toUpperCase()

    console.log(bobot_emp)
    console.log(bobot_emp.emp[jenis_jalan]);
    let emp = bobot_emp.emp[jenis_jalan]

    // perkotaan
    emp = emp['_']

    tipe_jalan = (Object.keys(emp).find((x)=>x==tipe_jalan)!==undefined)? tipe_jalan : Object.keys(emp)[0]

    let pembeda_c_0 = parseInt(Object.keys(emp[tipe_jalan])[0].replace('<','').replace('>','').replace('=',''))
    let key_c_0 = (c_0 < pembeda_c_0)? '<'+pembeda_c_0 : '>='+pembeda_c_0

    if (tipe_jalan=='2/2-TT') {
        const key_sm = (sm <= 6)? '<=6' : '>6'
        hasil_smp += sm * emp[tipe_jalan][key_c_0]['sm'][key_sm]
    } else {
        hasil_smp += sm * emp[tipe_jalan][key_c_0]['sm']
    }
    hasil_smp += ks * emp[tipe_jalan][key_c_0]['ks']
    hasil_smp += mp * 1.0
    hasil_smp += bb * 1.0
    hasil_smp += tb * 1.0

    return hasil_smp

}

export function hitung_smp_simpang_apill(sm=0.0,mp=0.0,ks=0.0,bb=0.0,tb=0.0,tipe_pendekat='terlindung') {

    let hasil_smp = 0.0

    const jenis_jalan = 'simpang_apill'

    console.log(bobot_emp)
    console.log(bobot_emp.emp[jenis_jalan]);
    let emp = bobot_emp.emp[jenis_jalan]

    // simpang_apill
    emp = emp[tipe_pendekat]
    
    hasil_smp += sm * emp['sm']
    hasil_smp += mp * emp['mp']
    hasil_smp += ks * emp['ks']
    hasil_smp += bb * 1.0
    hasil_smp += tb * 1.0

    return hasil_smp

}