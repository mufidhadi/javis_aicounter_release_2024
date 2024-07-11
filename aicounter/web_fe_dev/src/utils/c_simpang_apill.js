export function nilaiNormalWAh(lebar_jalan) {
    let w_ah = 4;
    if (lebar_jalan >= 15) {
        w_ah = 6;
    }
    if (lebar_jalan >= 10) {
        w_ah = 5;
    }
    return w_ah;
}

export function nilaiC(j, w_h, s) {
    let c = j * (w_h / s);
    return c;
}

export function nilaiJ(j_0, f_hs, f_uk, f_g, f_p, f_bki, f_bka) {
    let j = j_0 * f_hs * f_uk * f_g * f_p * f_bki * f_bka;
    return j;
}

export function nilaiFP(l_p, l, w_h) {
    let f_p = Math.round((l_p / 3) - (((l - 2) * ((l_p / 3) - w_h)) / l)) / w_h;
    return f_p;
}

export function nilaiJ0(l_e) {
    let j_0 = 600 * l_e;
    return j_0;
}

export function nilaiFHS(tipe_lingkungan, tipe_hambatan_samping, tipe_fase, rasio_kendaraan_tak_bermotor) {
    let f_hs = 0.0;
    let key_rasio_ktb = '0.00';
    let ktb = rasio_kendaraan_tak_bermotor;
    if (ktb >= 0.25) {
        key_rasio_ktb = '>=0.25';
    }
    if (ktb >= 0.20) {
        key_rasio_ktb = '0.20';
    }
    if (ktb >= 0.15) {
        key_rasio_ktb = '0.15';
    }
    if (ktb >= 0.10) {
        key_rasio_ktb = '0.10';
    }
    if (ktb >= 0.05) {
        key_rasio_ktb = '0.05';
    }

    if (tipe_lingkungan === 'komersial') {
        tipe_lingkungan = 'kom';
    }
    if (tipe_lingkungan === 'permukiman') {
        tipe_lingkungan = 'kim';
    }
    if (tipe_lingkungan === 'akses terbatas') {
        tipe_lingkungan = 'at';
    }

    let tabel_f_hs = {
        'kom': {
            'tinggi': {
                'terlawan': {
                    '0.00': 0.93,
                    '0.05': 0.88,
                    '0.10': 0.84,
                    '0.15': 0.79,
                    '0.20': 0.74,
                    '>=0.25': 0.70,
                },
                'terlindung': {
                    '0.00': 0.93,
                    '0.05': 0.91,
                    '0.10': 0.88,
                    '0.15': 0.87,
                    '0.20': 0.85,
                    '>=0.25': 0.81,
                }
            },
            'sedang': {
                'terlawan': {
                    '0.00': 0.94,
                    '0.05': 0.89,
                    '0.10': 0.88,
                    '0.15': 0.87,
                    '0.20': 0.85,
                    '>=0.25': 0.81,
                },
                'terlindung': {
                    '0.00': 0.94,
                    '0.05': 0.92,
                    '0.10': 0.89,
                    '0.15': 0.88,
                    '0.20': 0.86,
                    '>=0.25': 0.82,
                }
            },
            'rendah': {
                'terlawan': {
                    '0.00': 0.95,
                    '0.05': 0.90,
                    '0.10': 0.86,
                    '0.15': 0.81,
                    '0.20': 0.76,
                    '>=0.25': 0.72,
                },
                'terlindung': {
                    '0.00': 0.95,
                    '0.05': 0.93,
                    '0.10': 0.90,
                    '0.15': 0.89,
                    '0.20': 0.87,
                    '>=0.25': 0.83,
                }
            }
        },
        'kim': {
            'tinggi': {
                'terlawan': {
                    '0.00': 0.96,
                    '0.05': 0.91,
                    '0.10': 0.86,
                    '0.15': 0.81,
                    '0.20': 0.78,
                    '>=0.25': 0.72,
                },
                'terlindung': {
                    '0.00': 0.96,
                    '0.05': 0.94,
                    '0.10': 0.92,
                    '0.15': 0.99,
                    '0.20': 0.86,
                    '>=0.25': 0.84,
                }
            },
            'sedang': {
                'terlawan': {
                    '0.00': 0.97,
                    '0.05': 0.92,
                    '0.10': 0.87,
                    '0.15': 0.82,
                    '0.20': 0.79,
                    '>=0.25': 0.73,
                },
                'terlindung': {
                    '0.00': 0.97,
                    '0.05': 0.95,
                    '0.10': 0.93,
                    '0.15': 0.90,
                    '0.20': 0.87,
                    '>=0.25': 0.85,
                }
            },
            'rendah': {
                'terlawan': {
                    '0.00': 0.98,
                    '0.05': 0.93,
                    '0.10': 0.88,
                    '0.15': 0.83,
                    '0.20': 0.80,
                    '>=0.25': 0.74,
                },
                'terlindung': {
                    '0.00': 0.98,
                    '0.05': 0.96,
                    '0.10': 0.94,
                    '0.15': 0.91,
                    '0.20': 0.88,
                    '>=0.25': 0.86,
                }
            }
        },
        'at': {
            'tinggi': {
                'terlawan': {
                    '0.00': 1.00,
                    '0.05': 0.95,
                    '0.10': 0.90,
                    '0.15': 0.85,
                    '0.20': 0.80,
                    '>=0.25': 0.75,
                },
                'terlindung': {
                    '0.00': 1.00,
                    '0.05': 0.98,
                    '0.10': 0.95,
                    '0.15': 0.93,
                    '0.20': 0.90,
                    '>=0.25': 0.88,
                }
            },
            'sedang': {
                'terlawan': {
                    '0.00': 1.00,
                    '0.05': 0.95,
                    '0.10': 0.90,
                    '0.15': 0.85,
                    '0.20': 0.80,
                    '>=0.25': 0.75,
                },
                'terlindung': {
                    '0.00': 1.00,
                    '0.05': 0.98,
                    '0.10': 0.95,
                    '0.15': 0.93,
                    '0.20': 0.90,
                    '>=0.25': 0.88,
                }
            },
            'rendah': {
                'terlawan': {
                    '0.00': 1.00,
                    '0.05': 0.95,
                    '0.10': 0.90,
                    '0.15': 0.85,
                    '0.20': 0.80,
                    '>=0.25': 0.75,
                },
                'terlindung': {
                    '0.00': 1.00,
                    '0.05': 0.98,
                    '0.10': 0.95,
                    '0.15': 0.93,
                    '0.20': 0.90,
                    '>=0.25': 0.88,
                }
            },
        }
    };

    f_hs = tabel_f_hs[tipe_lingkungan][tipe_hambatan_samping][tipe_fase][key_rasio_ktb];

    return f_hs;
}

export function nilaiFUK(jumlah_juta_penduduk_kota) {
    let jpk = jumlah_juta_penduduk_kota;
    let f_uk = 0.82;
    if (jpk > 3.0) {
        f_uk = 1.05;
    }
    if (jpk > 1.0) {
        f_uk = 1.00;
    }
    if (jpk > 0.5) {
        f_uk = 0.94;
    }
    if (jpk > 0.1) {
        f_uk = 0.83;
    }
    return f_uk;
}

export function nilaiFG() {
    return 1;
}

export function nilaiFBKI(r_bki) {
    return 1.0 - r_bki * 0.16;
}

export function nilaiFBKA(r_bka) {
    return 1.0 - r_bka * 0.16;
}

export function nilaiRBKI(q_bki, q_total) {
    return q_bki / q_total;
}

export function nilaiRBKA(q_bka, q_total) {
    return q_bka / q_total;
}

export function nilaiDJ(q, c) {
    return q / c;
}

export function nilaiNQ(n_q1, n_q2) {
    return n_q1 + n_q2;
}

export function nilaiNQ1(d_j, s) {
    let n_q1 = 0;
    if (d_j > 0.5) {
        n_q1 = Math.pow((d_j - 1), 2) + ((8 * (d_j - 0.5)) / s);
        n_q1 = Math.pow(n_q1, -2);
        n_q1 += (d_j - 1);
        n_q1 *= (0.25 * s);
    }
    return n_q1;
}

export function nilaiNQ2(d_j, s, r_h, q) {
    return s * ((1 - r_h) / (1 - r_h * d_j)) * (q / 3600);
}

export function nilaiPA(n_q, l_m) {
    return n_q * (20 / l_m);
}

export function nilaiRKH(n_q, q, s) {
    return 0.9 * (n_q / (q * s)) * 3600;
}

export function nilaiNKH(q, r_kh) {
    return q * r_kh;
}

export function nilaiRKTB(q_ktb,q_kb) {
    return q_ktb / q_kb
}

// terlindung & terlawan (mkji2023.pdf hal 130)
export function hitung(
    waktu_hijau,
    total_siklus,
    lebar_efektif_pendekat,
    tipe_lingkungan,
    tipe_hambatan_samping, // sangat rendah, rendah, sedang, tinggi, dan sangat tinggi
    tipe_fase,
    jumlah_kendaraan_tak_bermotor,
    jumlah_juta_penduduk_kota,
    jumlah_belok_kiri,
    jumlah_belok_kanan,
    jumlah_smp_total,
    // jarak_garis_henti_ke_kendaraan_pertama_kiri = 1,
    // lebar_pendekat
) {
    let hasil = {
        nilai_j: 0.0,
        nilai_c: 0.0
    }

    let j_0 = nilaiJ0(lebar_efektif_pendekat)
    let r_ktb = nilaiRKTB(jumlah_kendaraan_tak_bermotor, (jumlah_smp_total - jumlah_kendaraan_tak_bermotor))
    let f_hs = nilaiFHS(tipe_lingkungan, tipe_hambatan_samping, tipe_fase, r_ktb)
    let f_uk = nilaiFUK(jumlah_juta_penduduk_kota)
    let f_g = nilaiFG()
    let f_p = 1
    let r_bki = nilaiRBKI(jumlah_belok_kiri, jumlah_smp_total)
    let r_bka = nilaiRBKA(jumlah_belok_kanan, jumlah_smp_total)
    let f_bki = nilaiFBKI(r_bki)
    let f_bka = nilaiFBKA(r_bka)

    let j = nilaiJ(j_0, f_hs, f_uk, f_g, f_p, f_bki, f_bka)
    let c = nilaiC(j, waktu_hijau, total_siklus)

    hasil.nilai_j = j
    hasil.nilai_c = c

    return hasil
}

// module.exports = {hitung}