function nilai_c(c_0, fc_lj, fc_pa, fc_hs, fc_uk) {
    return c_0 * fc_lj * fc_pa * fc_hs * fc_uk;
}

function nilai_c_0(tipe_jalan) {
    const tabel_c_0 = {
        '4/2-t': 1700,
        '6/2-t': 1700,
        '8/2-t': 1700,
        'searah': 1700,
        '2/2-t': 2800,
    };
    return tabel_c_0[tipe_jalan];
}

function nilai_fc_lj(tipe_jalan, l_le) {
    let fc_lj = 0.0;
    if (tipe_jalan === '4/2-t' || tipe_jalan === '4/2-t' || tipe_jalan === '4/2-t' || tipe_jalan === '4/2-t' || tipe_jalan === 'searah') {
        const tabel_fc_lj = {
            '3.00': 0.92,
            '3.25': 0.96,
            '3.50': 1.00,
            '3.75': 1.04,
            '4.00': 1.08,
        };
        fc_lj = tabel_fc_lj[l_le.toFixed(2)];
    } else if (tipe_jalan === '2/2-t') {
        const tabel_fc_lj = {
            '5.00': 0.56,
            '6.00': 0.87,
            '7.00': 1.00,
            '8.00': 1.14,
            '9.00': 1.25,
            '10.00': 1.29,
            '11.00': 1.34,
        };
        fc_lj = tabel_fc_lj[l_le.toFixed(2)];
    }
    return fc_lj;
}

function nilai_fc_pa(pa) {
    const tabel_fc_pa = {
        '50-50': 1.00,
        '55-45': 0.95,
        '60-40': 0.94,
        '65-35': 0.91,
        '70-30': 0.88,
    };
    return tabel_fc_pa[pa];
}

function nilai_fc_hs(tipe_jalan, khs, lebar_bahu_efektif, berbahu_berkereb = 'berbahu') {
    let fc_hs = 0;
    let key_lebar_bahu = 'a'; // <= 0.5
    if (lebar_bahu_efektif >= 2.0) {
        key_lebar_bahu = 'd';
    }
    if (lebar_bahu_efektif >= 1.5) {
        key_lebar_bahu = 'c';
    }
    if (lebar_bahu_efektif >= 1.0) {
        key_lebar_bahu = 'b';
    }
    const tabel_fc_hs = {
        'berbahu': {},
        'berkereb': {},
    };
    tabel_fc_hs['berbahu'] = {
        '4/2-t': {
            'sangat_rendah': {
                'a': 0.96,
                'b': 0.98,
                'c': 1.01,
                'd': 1.03,
            },
            'rendah': {
                'a': 0.94,
                'b': 0.97,
                'c': 1.00,
                'd': 1.02,
            },
            'sedang': {
                'a': 0.92,
                'b': 0.95,
                'c': 0.98,
                'd': 1.00,
            },
            'tinggi': {
                'a': 0.88,
                'b': 0.92,
                'c': 0.95,
                'd': 0.96,
            },
            'sangat_tinggi': {
                'a': 0.84,
                'b': 0.88,
                'c': 0.92,
                'd': 0.96,
            },
        },
        '2/2-t': {
            'sangat_rendah': {
                'a': 0.94,
                'b': 0.96,
                'c': 0.99,
                'd': 1.01,
            },
            'rendah': {
                'a': 0.92,
                'b': 0.94,
                'c': 0.97,
                'd': 1.00,
            },
            'sedang': {
                'a': 0.89,
                'b': 0.92,
                'c': 0.95,
                'd': 0.98,
            },
            'tinggi': {
                'a': 0.82,
                'b': 0.86,
                'c': 0.90,
                'd': 0.95,
            },
            'sangat_tinggi': {
                'a': 0.73,
                'b': 0.79,
                'c': 0.85,
                'd': 0.91,
            },
        },
    };
    tabel_fc_hs['berkereb'] = {
        '4/2-t': {
            'sangat_rendah': {
                'a': 0.95,
                'b': 0.97,
                'c': 0.99,
                'd': 1.01,
            },
            'rendah': {
                'a': 0.94,
                'b': 0.96,
                'c': 0.98,
                'd': 1.00,
            },
            'sedang': {
                'a': 0.91,
                'b': 0.93,
                'c': 0.95,
                'd': 0.98,
            },
            'tinggi': {
                'a': 0.86,
                'b': 0.89,
                'c': 0.92,
                'd': 0.95,
            },
            'sangat_tinggi': {
                'a': 0.81,
                'b': 0.85,
                'c': 0.88,
                'd': 0.92,
            },
        },
        '2/2-t': {
            'sangat_rendah': {
                'a': 0.93,
                'b': 0.95,
                'c': 0.97,
                'd': 0.99,
            },
            'rendah': {
                'a': 0.90,
                'b': 0.92,
                'c': 0.95,
                'd': 0.97,
            },
            'sedang': {
                'a': 0.86,
                'b': 0.88,
                'c': 0.91,
                'd': 0.94,
            },
            'tinggi': {
                'a': 0.78,
                'b': 0.81,
                'c': 0.84,
                'd': 0.88,
            },
            'sangat_tinggi': {
                'a': 0.68,
                'b': 0.72,
                'c': 0.77,
                'd': 0.82,
            },
        },
    };
    if (tipe_jalan === 'searah') {
        tipe_jalan = '2/2-t';
    }
    fc_hs = tabel_fc_hs[berbahu_berkereb][tipe_jalan][khs][key_lebar_bahu];
    if (tipe_jalan === '6/2-t' || tipe_jalan === '8/2-t') {
        tipe_jalan = '4/2-t';
        fc_hs = nilai_fc_hs_6hs_8hs(tabel_fc_hs[berbahu_berkereb][tipe_jalan][khs][key_lebar_bahu]);
    }
    return fc_hs;
}

function nilai_fc_hs_6hs_8hs(fc_hs_4hs) {
    return 1 - (0.8 * (1 - fc_hs_4hs));
}

function nilai_fc_uk(ukuran_kota) {
    let key_ukuran_kota = 'a';
    if (typeof ukuran_kota === 'string') {
        if (ukuran_kota === 'sangat_kecil' || ukuran_kota === 'kota_kecil') {
            key_ukuran_kota = 'a';
        }
        if (ukuran_kota === 'kecil' || ukuran_kota === 'kota_kecil') {
            key_ukuran_kota = 'b';
        }
        if (ukuran_kota === 'sedang' || ukuran_kota === 'kota_menengah') {
            key_ukuran_kota = 'c';
        }
        if (ukuran_kota === 'besar' || ukuran_kota === 'kota_besar') {
            key_ukuran_kota = 'd';
        }
        if (ukuran_kota === 'sangat_besar' || ukuran_kota === 'kota_metropolitan') {
            key_ukuran_kota = 'e';
        }
    } else {
        key_ukuran_kota = 'a';
        if (ukuran_kota > 3.0) {
            key_ukuran_kota = 'e';
        }
        if (ukuran_kota > 1.0) {
            key_ukuran_kota = 'd';
        }
        if (ukuran_kota > 0.5) {
            key_ukuran_kota = 'c';
        }
        if (ukuran_kota > 0.1) {
            key_ukuran_kota = 'b';
        }
    }
    const tabel_fc_uk = {
        'a': 0.86,
        'b': 0.90,
        'c': 0.94,
        'd': 1.00,
        'e': 1.04,
    };
    return tabel_fc_uk[key_ukuran_kota];
}

function khs_dari_frekuensi_kejadian(frekuensi) {
    let khs = 'sangat_rendah';
    if (frekuensi >= 900) {
        khs = 'sangat_tinggi';
    }
    if (frekuensi > 500) {
        khs = 'tinggi';
    }
    if (frekuensi > 300) {
        khs = 'sedang';
    }
    if (frekuensi > 100) {
        khs = 'rendah';
    }
    return khs;
}

const TIPE_JALAN = {
    'searah': 'searah', // searah
    '1/1': 'searah', // searah, satu jalur satu arah
    '2/1': '2/1', // 2 lajur 1 arah
    '2/2-t': '2/2-t', // 2 lajur 2 arah terbagi
    '2/2-tt': '2/2-tt', // 2 lajur 2 arah tak terbagi
    '4/2-t': '4/2-t', // 4 lajur 2 arah terbagi
    '4/2-tt': '4/2-tt', // 4 lajur 2 arah tak terbagi
    '6/2-t': '6/2-t', // 6 lajur 2 arah terbagi
    '8/2-t': '8/2-t', // 8 lajur 2 arah terbagi
};

function nilai_d_j(q, C) {
    const d_j = q / C; // derajat kejenuhan = volume lalu lintas (smp/jam) dibagi kapasitas jalan
    return d_j;
}

// tes perhitungan
// console.log('');
// console.log('=============================');
// console.log('UJI SOAL');
// console.log('=============================');

// const lebarTiapLajur = 3.50;
// const jumlahLajur = 4;
// const jumlahJalur = 2;

// const tipeJalan = TIPE_JALAN['4/2-t'];
// const lebarJalurEfektif = lebarTiapLajur;
// const pemisahanArah = '50-50'; // pembagian arah kendaraan 50% - 50%
// const kelasHambatanSamping = 'rendah'; // Daerah Permukiman, ada beberapa angkutan umum (angkutan kota).
// const lebarBahuEfektif = 3.0;
// const jenisBahuAtauKereb = 'berbahu';
// const ukuranKota = 'sedang';

// const volumeSMPperJamSaatIni = Math.floor(Math.random() * (1500 - 500 + 1)) + 500;

// const hasil_hitungan = hitung(
//     tipeJalan,
//     lebarJalurEfektif,
//     pemisahanArah,
//     kelasHambatanSamping,
//     lebarBahuEfektif,
//     jenisBahuAtauKereb,
//     ukuranKota,
//     volumeSMPperJamSaatIni
// )

// console.log(hasil_hitungan)

function hitung(
    tipeJalan,
    lebarJalurEfektif,
    pemisahanArah,
    kelasHambatanSamping,
    lebarBahuEfektif,
    jenisBahuAtauKereb,
    ukuranKota,
    volumeSMPperJamSaatIni
) {
    // console.log('tipeJalan:', tipeJalan);
    // console.log('lebarTiapLajur:', lebarTiapLajur);
    // console.log('jumlahLajur:', jumlahLajur);
    // console.log('jumlahJalur:', jumlahJalur);
    // console.log('lebarJalurEfektif:', lebarJalurEfektif);
    // console.log('pemisahanArah:', pemisahanArah);
    // console.log('kelasHambatanSamping:', kelasHambatanSamping);
    // console.log('lebarBahuEfektif:', lebarBahuEfektif);
    // console.log('jenisBahuAtauKereb:', jenisBahuAtauKereb);
    // console.log('ukuranKota:', ukuranKota);
    // console.log('volumeSMPperJamSaatIni:', volumeSMPperJamSaatIni);

    // console.log('');
    // console.log('=============================');
    // console.log('HASIL HITUNGAN');
    // console.log('=============================');

    const c_0 = nilai_c_0(tipeJalan);
    const fc_lj = nilai_fc_lj(tipeJalan, lebarJalurEfektif);
    const fc_pa = nilai_fc_pa(pemisahanArah);
    const fc_hs = nilai_fc_hs(tipeJalan, kelasHambatanSamping, lebarBahuEfektif, jenisBahuAtauKereb);
    const fc_uk = nilai_fc_uk(ukuranKota);

    const C = nilai_c(c_0, fc_lj, fc_pa, fc_hs, fc_uk);

    const d_j = nilai_d_j(volumeSMPperJamSaatIni, C);

    // console.log('c_0:', c_0);
    // console.log('fc_lj:', fc_lj);
    // console.log('fc_pa:', fc_pa);
    // console.log('fc_hs:', fc_hs);
    // console.log('fc_uk:', fc_uk);
    // console.log('');
    // console.log('C:', C);
    // console.log('C/60:', (C / 60).toFixed(2));
    // console.log('');
    // console.log('d_j:', d_j.toFixed(2));
    
    return {
        c_0: c_0,
        fc_lj: fc_lj,
        fc_pa: fc_pa,
        fc_hs: fc_hs,
        fc_uk: fc_uk,
        c:C,
        d_j:d_j,
    }
}

module.exports = {hitung}